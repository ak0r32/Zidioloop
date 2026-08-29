import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get("type") || "volume"; // volume, sentiment, themes

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    if (dataType === "volume") {
      // Feedback volume over time
      const feedback = await prisma.feedback.findMany({
        where: {
          workspaceId: session.user.workspaceId,
          createdAt: { gte: sixtyDaysAgo },
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      const volumeByDate: Record<string, number> = {};
      feedback.forEach((item) => {
        const date = item.createdAt.toISOString().split("T")[0];
        volumeByDate[date] = (volumeByDate[date] || 0) + 1;
      });

      const data = Object.entries(volumeByDate).map(([date, count]) => ({
        date,
        count,
      }));

      return NextResponse.json({ data });
    }

    if (dataType === "sentiment") {
      // Sentiment distribution over time
      const feedback = await prisma.feedback.findMany({
        where: {
          workspaceId: session.user.workspaceId,
          createdAt: { gte: sixtyDaysAgo },
        },
        select: { createdAt: true, sentiment: true },
        orderBy: { createdAt: "asc" },
      });

      const sentimentByDate: Record<string, Record<string, number>> = {};
      feedback.forEach((item) => {
        const date = item.createdAt.toISOString().split("T")[0];
        if (!sentimentByDate[date]) {
          sentimentByDate[date] = { POS: 0, NEU: 0, NEG: 0 };
        }
        const sentiment = item.sentiment || "NEU";
        sentimentByDate[date][sentiment]++;
      });

      const data = Object.entries(sentimentByDate).map(([date, sentiments]) => ({
        date,
        ...sentiments,
      }));

      return NextResponse.json({ data });
    }

    if (dataType === "themes") {
      // Theme trends
      const feedbackThemes = await prisma.feedbackTheme.findMany({
        where: {
          feedback: {
            workspaceId: session.user.workspaceId,
            createdAt: { gte: sixtyDaysAgo },
          },
        },
        include: {
          theme: true,
          feedback: { select: { createdAt: true } },
        },
      });

      const themesByDate: Record<string, Record<string, number>> = {};
      feedbackThemes.forEach((item) => {
        const date = item.feedback.createdAt.toISOString().split("T")[0];
        if (!themesByDate[date]) {
          themesByDate[date] = {};
        }
        const themeName = item.theme.name;
        themesByDate[date][themeName] = (themesByDate[date][themeName] || 0) + 1;
      });

      // Get top themes
      const themeVolume: Record<string, number> = {};
      feedbackThemes.forEach((item) => {
        const themeName = item.theme.name;
        themeVolume[themeName] = (themeVolume[themeName] || 0) + 1;
      });

      const topThemes = Object.entries(themeVolume)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name);

      const data = Object.entries(themesByDate).map(([date, themes]) => ({
        date,
        ...Object.fromEntries(topThemes.map((t) => [t, themes[t] || 0])),
      }));

      return NextResponse.json({ data, topThemes });
    }

    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to fetch trends data" }, { status: 500 });
  }
}
