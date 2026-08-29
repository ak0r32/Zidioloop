import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  try {
    const themes = await prisma.theme.findMany({
      where: { workspaceId: session.user.workspaceId },
      include: {
        feedbackThemes: {
          include: {
            feedback: {
              select: { sentiment: true },
            },
          },
        },
      },
    });

    const enrichedThemes = themes.map((theme) => {
      const feedbackCount = theme.feedbackThemes.length;
      const sentiments = theme.feedbackThemes.map((ft) => ft.feedback.sentiment);
      const posCount = sentiments.filter((s) => s === "POS").length;
      const negCount = sentiments.filter((s) => s === "NEG").length;
      const neuCount = sentiments.filter((s) => s === "NEU").length;

      return {
        id: theme.id,
        name: theme.name,
        description: theme.description,
        color: theme.color,
        feedbackCount,
        sentiments: {
          POS: posCount,
          NEU: neuCount,
          NEG: negCount,
        },
        avgSentiment: feedbackCount > 0 ? ((posCount - negCount) / feedbackCount * 100).toFixed(0) : 0,
      };
    });

    return NextResponse.json({ themes: enrichedThemes });
  } catch (error) {
    return NextResponse.json({ message: "Unable to fetch themes" }, { status: 500 });
  }
}
