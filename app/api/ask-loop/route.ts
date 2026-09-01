import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { prisma } from "@/lib/db";
import { canViewFeedback } from "@/lib/rbac";
import { getCurrentSession } from "@/lib/session";

function buildLocalAnswer(question: string, items: Array<{ content: string; channel: string; sentiment?: string | null }>) {
  const normalizedQuestion = question.toLowerCase();
  const meaningfulWords = normalizedQuestion
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2)
    .map((word) => word.trim());

  const keywordMap: Record<string, string[]> = {
    pricing: ["price", "pricing", "cost", "cheap", "expensive", "billing", "refund"],
    support: ["support", "help", "customer service", "agent", "response time"],
    bug: ["bug", "error", "crash", "broken", "issue", "fails", "glitch"],
    usability: ["easy", "hard", "confusing", "UX", "interface", "navigation", "slow"],
    delivery: ["delivery", "shipping", "speed", "late", "tracking"],
    checkout: ["checkout", "payment", "purchase", "billing", "card"],
  };

  let relevantKeywords: string[] = [];
  for (const [topic, words] of Object.entries(keywordMap)) {
    if (words.some((word) => normalizedQuestion.includes(word))) {
      relevantKeywords = [...relevantKeywords, ...words];
    }
  }

  const filtered = items.filter((item) => {
    const content = item.content.toLowerCase();
    if (!meaningfulWords.length) return true;

    const matchesQuestion = meaningfulWords.some((word) => content.includes(word));
    const matchesKeywords = relevantKeywords.some((keyword) => content.includes(keyword));
    return matchesQuestion || matchesKeywords;
  });

  const primary = filtered.length > 0 ? filtered : items;
  const positive = primary.filter((item) => item.sentiment === "POS").length;
  const neutral = primary.filter((item) => item.sentiment === "NEU").length;
  const negative = primary.filter((item) => item.sentiment === "NEG").length;
  const channels = Array.from(new Set(primary.map((item) => item.channel))).slice(0, 4);
  const examples = primary.slice(0, 3).map((item) => item.content);

  if (!examples.length) {
    return "I could not find any feedback matching your question in this workspace yet. Try uploading more customer comments or ask about a broader topic.";
  }

  const summary = [
    `I reviewed ${primary.length} related feedback items in your workspace.`,
    `Positive: ${positive}, Neutral: ${neutral}, Negative: ${negative}.`,
    channels.length ? `Most common sources: ${channels.join(", ")}.` : "",
    "Top themes suggest the main issue is concentrated around the user experience and service quality described in the comments.",
  ]
    .filter(Boolean)
    .join(" ");

  return `${summary} Example feedback: "${examples[0]}"${examples[1] ? `; "${examples[1]}"` : ""}${examples[2] ? `; "${examples[2]}"` : ""}`;
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  if (!canViewFeedback(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const question = String(body?.question ?? "").trim();

    if (!question) {
      return NextResponse.json({ message: "Please enter a question" }, { status: 400 });
    }

    const feedback = await prisma.feedback.findMany({
      where: { workspaceId: session.user.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        content: true,
        channel: true,
        sentiment: true,
        createdAt: true,
      },
    });

    if (!feedback.length) {
      return NextResponse.json({ message: "No feedback has been uploaded for this workspace yet." }, { status: 404 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        const anthropic = new Anthropic({ apiKey });
        const response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 500,
          system: `You are LOOP, an AI customer feedback analyst. Answer the user's question about feedback data.
Rules:
- Ground your answer in the feedback examples provided
- Always report sentiment distribution accurately
- If positive feedback exists, highlight it - don't ignore it
- Be specific about what customers are saying
- Output plain text only, NOT JSON or markdown`,
          messages: [
            {
              role: "user",
              content: `Question: ${question}\n\nFeedback data (${feedback.length} items):\n${feedback
                .slice(0, 100)
                .map((item) => `[${item.channel}] ${item.sentiment ?? "UNKNOWN"}: ${item.content}`)
                .join("\n")}`,
            },
          ],
        });

        const answer = response.content
          .map((part) => (part.type === "text" ? part.text : ""))
          .join("")
          .trim();

        if (answer) {
          return NextResponse.json({ answer });
        }
      } catch (error) {
        console.warn("Claude Ask LOOP failed, falling back to local analysis.", error);
      }
    }

    const answer = buildLocalAnswer(question, feedback);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Ask LOOP failed:", error);
    return NextResponse.json({ message: "Unable to process the question right now." }, { status: 500 });
  }
}
