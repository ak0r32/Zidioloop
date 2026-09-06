import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { StatCard, FeedbackItem, EmptyState } from "@/components/dashboard";
import { DashboardWithOnboarding } from "./client-dashboard";

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";
  const isAnalyst = session.user.role === "ANALYST";
  const isViewer = session.user.role === "VIEWER";

  const [totalFeedback, recentFeedback, weeklyFeedback, sentimentBreakdown, totalThemes] = await Promise.all([
    prisma.feedback.count({
      where: { workspaceId: session.user.workspaceId },
    }),
    prisma.feedback.findMany({
      where: { workspaceId: session.user.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.feedback.count({
      where: {
        workspaceId: session.user.workspaceId,
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        },
      },
    }),
    prisma.feedback.groupBy({
      by: ["sentiment"],
      where: { workspaceId: session.user.workspaceId },
      _count: true,
    }),
    prisma.theme.count({
      where: { workspaceId: session.user.workspaceId },
    }),
  ]);

  const negativeCount = sentimentBreakdown.find((s) => s.sentiment === "NEG")?._count || 0;
  const negativePercentage = totalFeedback > 0 ? Math.round((negativeCount / totalFeedback) * 100) : 0;

  const posCount = sentimentBreakdown.find((s) => s.sentiment === "POS")?._count || 0;
  const neuCount = sentimentBreakdown.find((s) => s.sentiment === "NEU")?._count || 0;

  return (
    <DashboardWithOnboarding
      session={session}
      isAdmin={isAdmin}
      isAnalyst={isAnalyst}
      totalFeedback={totalFeedback}
      weeklyFeedback={weeklyFeedback}
      posCount={posCount}
      neuCount={neuCount}
      negativeCount={negativeCount}
      negativePercentage={negativePercentage}
      totalThemes={totalThemes}
      recentFeedback={recentFeedback}
    />
  );
}

type DashboardProps = {
  session: any;
  isAdmin: boolean;
  isAnalyst: boolean;
  totalFeedback: number;
  weeklyFeedback: number;
  posCount: number;
  neuCount: number;
  negativeCount: number;
  negativePercentage: number;
  totalThemes: number;
  recentFeedback: any[];
};
