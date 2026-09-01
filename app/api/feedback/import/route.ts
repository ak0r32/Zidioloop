import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { canManageFeedback } from "@/lib/rbac";

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^_+|_+$/g, "");

const normalizeValue = (value: unknown) => String(value ?? "").trim();

const readCell = (row: Record<string, unknown>, aliases: string[]) => {
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
    return [] as Record<string, unknown>[];
  }

  const rows = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const headers = parseCsvLine(rows[0].replace(/^\uFEFF/, ""));

  return rows
    .slice(1)
    .filter((row) => row.trim().length > 0)
    .map((row) => {
      const values = parseCsvLine(row);
      return headers.reduce<Record<string, unknown>>((acc, header, index) => {
        acc[header] = values[index] ?? "";
        return acc;
      }, {});
    });
};

const parseJsonRecords = (jsonText: string) => {
  const parsed = JSON.parse(jsonText) as unknown;

  if (Array.isArray(parsed)) {
    return parsed as Record<string, unknown>[];
  }

  if (parsed && typeof parsed === "object") {
    const collection = parsed as Record<string, unknown>;
    const candidates = ["data", "items", "results", "feedback", "records"];
    for (const candidate of candidates) {
      const value = collection[candidate];
      if (Array.isArray(value)) {
        return value as Record<string, unknown>[];
      }
    }
    return [collection];
  }

  return [] as Record<string, unknown>[];
};

const parseExcelRows = async (file: File) => {
  const xlsx = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [String(key), value ?? ""]))) as Record<string, unknown>[];
};

const localSentimentAnalysis = (content: string): "POS" | "NEG" | "NEU" | null => {
  const lowerContent = content.toLowerCase();

  const positiveIndicators = [
    "good", "great", "excellent", "amazing", "awesome", "love", "liked", "happy", "satisfied",
    "helpful", "impressed", "wonderful", "fantastic", "pleasant", "easy", "smooth",
    "fast", "quick", "efficient", "perfect", "beautiful", "intuitive", "works well", "very happy",
    "recommend", "great service", "highly satisfied", "best", "brilliant", "outstanding",
    "friendly", "professional", "appreciate", "thank you", "thanks", "well done", "reasonable pricing"
  ];

  const negativeIndicators = [
    "bad", "terrible", "awful", "horrible", "poor", "broken", "issue", "problem", "error",
    "crash", "fail", "disappointed", "frustrated", "angry", "hate", "worst", "useless",
    "waste", "doesn't work", "not working", "slow", "expensive", "overpriced", "rude",
    "unhappy", "complaint", "bugs", "glitched", "impossible", "confusing", "complicated"
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  for (const indicator of positiveIndicators) {
    const matches = lowerContent.split(indicator).length - 1;
    positiveScore += matches;
  }

  for (const indicator of negativeIndicators) {
    const matches = lowerContent.split(indicator).length - 1;
    negativeScore += matches;
  }

  if (positiveScore > negativeScore + 1) return "POS";
  if (negativeScore > positiveScore + 1) return "NEG";
  return null;
};

const normalizeSentiment = (value: string | undefined, rating?: number, content?: string): "POS" | "NEG" | "NEU" | null => {
  const candidate = normalizeValue(value).toLowerCase();

  if (rating !== undefined && Number.isFinite(rating)) {
    if (rating <= 2) return "NEG";
    if (rating === 3) return "NEU";
    if (rating >= 4) return "POS";
  }

  if (candidate) {
    if (["positive", "pos", "happy", "good", "great", "satisfied", "liked", "love", "excellent"].includes(candidate)) {
      return "POS";
    }

    if (["negative", "neg", "bad", "poor", "frustrated", "angry", "hate", "issue", "broken", "terrible"].includes(candidate)) {
      return "NEG";
    }

    if (["neutral", "mixed", "nuetral", "meh", "average"].includes(candidate)) {
      return "NEU";
    }

    if (["1", "2", "3"].includes(candidate)) {
      return candidate === "3" ? "NEU" : "NEG";
    }

    if (["4", "5"].includes(candidate)) {
      return "POS";
    }
  }

  if (content) {
    return localSentimentAnalysis(content);
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

const inferThemeAndSentiment = async (content: string, channel: string) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { themes: [] as string[], sentiment: null as "POS" | "NEG" | "NEU" | null };
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      system: `You analyze customer feedback for sentiment and themes. Return JSON with:
- sentiment: "POS" for satisfied customers, "NEG" for unhappy, "NEU" for neutral. Recognize positive feedback generously.
- themes: 1-3 category labels (Billing, Support, UX, Performance, Feature, Service, Quality, etc.)
Always return valid JSON: {"sentiment":"POS","themes":["Category1"]}`,
      messages: [
        {
          role: "user",
          content: `Analyze this feedback:\n${content}\n\nChannel: ${channel}`,
        },
      ],
    });

    const text = response.content
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("")
      .trim();

    if (!text) {
      return { themes: [] as string[], sentiment: null as "POS" | "NEG" | "NEU" | null };
    }

    const parsed = JSON.parse(text);
    const sentiment = (["POS", "NEG", "NEU"].includes(parsed.sentiment) ? parsed.sentiment : null) as "POS" | "NEG" | "NEU" | null;
    const themes = Array.isArray(parsed.themes)
      ? parsed.themes.map((item: string) => String(item).trim()).filter(Boolean).slice(0, 3)
      : [];

    return { themes, sentiment };
  } catch (error) {
    console.warn("Claude sentiment+theme analysis failed, using fallback.", error);
  }

  return { themes: [] as string[], sentiment: null as "POS" | "NEG" | "NEU" | null };
};

const normalizeRecord = (row: Record<string, unknown>) => {
  const content = readCell(row, ["message", "feedback", "content", "comment", "text", "review", "response", "note", "description"]);
  const channel = readCell(row, ["channel", "source", "platform", "medium", "origin", "site"]) || "Email";
  const customerLabel = readCell(row, ["customerlabel", "customer", "customername", "customer_name", "label", "user"]);
  const sourceRef = readCell(row, ["customerid", "customerId", "sourceref", "source_ref", "reference", "ref", "id", "ticketid"]);
  const ratingRaw = readCell(row, ["rating", "score", "stars", "sentimentrating"]);
  const rating = Number.isFinite(Number(ratingRaw)) ? Number(ratingRaw) : undefined;
  const sentimentValue = readCell(row, ["sentiment", "mood", "sentimentlabel"]);
  const timestamp = readCell(row, ["timestamp", "createdat", "created", "date", "submittedat", "time"]);
  const themeValue = readCell(row, ["theme", "themes", "category", "topic", "tags"]);

  return {
    content,
    channel,
    customerLabel,
    sourceRef: sourceRef || customerLabel || "",
    sentiment: normalizeSentiment(sentimentValue, rating, content),
    status: normalizeStatus(readCell(row, ["status", "feedbackstatus", "state"])),
    createdAt: parseCreatedAt(timestamp),
    themeNames: extractThemes(themeValue),
  };
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
      return NextResponse.json({ message: "Please upload a CSV, JSON, or Excel file" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const supported = [".csv", ".json", ".xlsx", ".xls"];

    if (!supported.some((ext) => fileName.endsWith(ext))) {
      return NextResponse.json({ message: "Only CSV, JSON, XLS, or XLSX files are supported" }, { status: 400 });
    }

    let rows: Record<string, unknown>[] = [];

    if (fileName.endsWith(".json")) {
      rows = parseJsonRecords(await file.text());
    } else if (fileName.endsWith(".csv")) {
      rows = parseCsv(await file.text());
    } else {
      rows = await parseExcelRows(file);
    }

    if (!rows.length) {
      return NextResponse.json({ message: "The uploaded file is empty or has no supported feedback rows" }, { status: 400 });
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const record = normalizeRecord(row);

      if (!record.content) {
        skippedCount += 1;
        continue;
      }

      let sentiment = record.sentiment;
      let themeNames = record.themeNames;

      if (!sentiment || themeNames.length === 0) {
        const claudeAnalysis = await inferThemeAndSentiment(record.content, record.channel);
        if (!sentiment) {
          sentiment = claudeAnalysis.sentiment;
        }
        if (themeNames.length === 0 && claudeAnalysis.themes.length > 0) {
          themeNames = claudeAnalysis.themes;
        } else if (themeNames.length === 0) {
          themeNames = ["Feedback"];
        }
      }

      if (!sentiment) {
        sentiment = localSentimentAnalysis(record.content) ?? null;
      }

      const feedback = await prisma.feedback.create({
        data: {
          content: record.content,
          channel: record.channel || "Email",
          customerLabel: record.customerLabel || null,
          sourceRef: record.sourceRef || null,
          sentiment: sentiment ?? undefined,
          status: record.status,
          createdAt: record.createdAt,
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
    console.error("Feedback import failed:", error);
    return NextResponse.json({ message: "Unable to import file. Please check the format and try again." }, { status: 500 });
  }
}
