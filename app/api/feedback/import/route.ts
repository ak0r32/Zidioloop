import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { canManageFeedback } from "@/lib/rbac";

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^_+|_+$/g, "");

const normalizeValue = (value: string | undefined) => (value ?? "").trim();

const readCell = (row: Record<string, string>, aliases: string[]) => {
  for (const alias of aliases) {
    const match = Object.entries(row).find(([key]) => normalizeHeader(key) === normalizeHeader(alias));
    if (match) {
      return normalizeValue(match[1]);
    }
  }

  return "";
};

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    if (char === "\n" || char === "\r") {
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
};

const parseCsv = (csv: string) => {
  if (!csv.trim()) {
    return [] as Record<string, string>[];
  }

  const rows = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const headers = parseCsvLine(rows[0].replace(/^\uFEFF/, ""));

  return rows
    .slice(1)
    .filter((row) => row.trim().length > 0)
    .map((row) => {
      const values = parseCsvLine(row);
      return headers.reduce<Record<string, string>>((acc, header, index) => {
        acc[header] = values[index] ?? "";
        return acc;
      }, {});
    });
};

const normalizeSentiment = (value: string | undefined) => {
  const normalized = normalizeValue(value).toLowerCase();

  if (!normalized) {
    return null;
  }

  if (["positive", "pos", "happy", "good", "great", "satisfied", "liked", "love"].includes(normalized)) {
    return "POS" as const;
  }

  if (["negative", "neg", "bad", "poor", "frustrated", "angry", "hate", "issue"].includes(normalized)) {
    return "NEG" as const;
  }

  if (["neutral", "mixed", "nuetral", "meh", "average"].includes(normalized)) {
    return "NEU" as const;
  }

  if (["1", "2", "3"].includes(normalized)) {
    return "NEG" as const;
  }

  if (["4", "5"].includes(normalized)) {
    return "POS" as const;
  }

  return null;
};

const normalizeStatus = (value: string | undefined) => {
  const normalized = normalizeValue(value).toLowerCase();

  if (["actioned", "resolved", "completed", "closed"].includes(normalized)) {
    return "ACTIONED" as const;
  }

  if (["reviewed", "in review", "under review"].includes(normalized)) {
    return "REVIEWED" as const;
  }

  return "NEW" as const;
};

const parseCreatedAt = (value: string | undefined) => {
  const candidate = normalizeValue(value);

  if (!candidate) {
    return new Date();
  }

  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const extractThemes = (value: string | undefined) => {
  const raw = normalizeValue(value);

  if (!raw) {
    return [] as string[];
  }

  return raw
    .split(/[|;,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/^#+/, ""));
};

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  if (!canManageFeedback(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Please upload a CSV file" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json({ message: "Only CSV files are supported" }, { status: 400 });
    }

    const csvContent = await file.text();
    const rows = parseCsv(csvContent);

    if (!rows.length) {
      return NextResponse.json({ message: "CSV file is empty or missing headers" }, { status: 400 });
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const content = readCell(row, ["content", "feedback", "comment", "message", "text", "note", "response"]);
      if (!content) {
        skippedCount += 1;
        continue;
      }

      const channel = readCell(row, ["channel", "source", "platform", "medium", "origin"]) || "Email";
      const customerLabel = readCell(row, ["customerlabel", "customer", "customername", "customer_name", "label", "user"]);
      const sourceRef = readCell(row, ["sourceref", "source_ref", "reference", "ref", "id", "customerid"]);
      const sentiment = normalizeSentiment(readCell(row, ["sentiment", "rating", "mood", "sentimentrating"]));
      const status = normalizeStatus(readCell(row, ["status", "feedbackstatus", "state"]));
      const createdAt = parseCreatedAt(readCell(row, ["createdat", "created", "date", "timestamp", "submittedat" ]));
      const themeNames = extractThemes(readCell(row, ["theme", "themes", "category", "topic", "tags"]));

      const feedback = await prisma.feedback.create({
        data: {
          content,
          channel,
          customerLabel: customerLabel || null,
          sourceRef: sourceRef || null,
          sentiment: sentiment ?? undefined,
          status,
          createdAt,
          workspaceId: session.user.workspaceId,
        },
      });

      for (const themeName of themeNames) {
        const theme = await prisma.theme.upsert({
          where: {
            workspaceId_name: {
              workspaceId: session.user.workspaceId,
              name: themeName,
            },
          },
          update: {},
          create: {
            name: themeName,
            workspaceId: session.user.workspaceId,
          },
        });

        await prisma.feedbackTheme.upsert({
          where: {
            feedbackId_themeId: {
              feedbackId: feedback.id,
              themeId: theme.id,
            },
          },
          update: {
            confidence: 0.8,
          },
          create: {
            feedbackId: feedback.id,
            themeId: theme.id,
            confidence: 0.8,
          },
        });
      }

      importedCount += 1;
    }

    return NextResponse.json(
      {
        importedCount,
        skippedCount,
        message: `Imported ${importedCount} feedback items${skippedCount ? `, skipped ${skippedCount}` : ""}.`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CSV import failed:", error);
    return NextResponse.json({ message: "Unable to import CSV file" }, { status: 500 });
  }
}
