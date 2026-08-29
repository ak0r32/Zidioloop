import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { StatCard, FeedbackItem, EmptyState } from "@/components/dashboard";

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
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Welcome back</p>
              <h1 className="mt-2 text-4xl font-bold bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                {session.user.name}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Workspace • <span className="text-slate-300">{session.user.role}</span>
              </p>
            </div>
            <div className="flex gap-3">
              {(isAdmin || isAnalyst) && (
                <Link
                  href="/feedback"
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-500 transition flex items-center gap-2"
                >
                  ➕ Add Feedback
                </Link>
              )}
              <Link
                href="/ask-loop"
                className="px-4 py-2 rounded-lg border border-violet-500/50 text-violet-300 font-medium hover:bg-violet-500/10 transition flex items-center gap-2"
              >
                🤖 Ask LOOP
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard label="Total feedback" value={totalFeedback} icon="💬" />
          <StatCard label="This week" value={weeklyFeedback} icon="📅" trend={{ value: 12, direction: "up" }} />
          <StatCard label="Negative sentiment" value={`${negativePercentage}%`} icon="😞" />
          <StatCard label="Active themes" value={totalThemes} icon="🏷️" />
        </section>

        {/* Sentiment Distribution */}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr] mb-10">
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Sentiment Breakdown</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="text-green-400">●</span> Positive
                  </span>
                  <span className="text-sm font-semibold text-white">{posCount} ({totalFeedback > 0 ? Math.round((posCount / totalFeedback) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${totalFeedback > 0 ? (posCount / totalFeedback) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="text-slate-400">●</span> Neutral
                  </span>
                  <span className="text-sm font-semibold text-white">{neuCount} ({totalFeedback > 0 ? Math.round((neuCount / totalFeedback) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-slate-500 transition-all"
                    style={{ width: `${totalFeedback > 0 ? (neuCount / totalFeedback) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="text-red-400">●</span> Negative
                  </span>
                  <span className="text-sm font-semibold text-white">{negativeCount} ({negativePercentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all"
                    style={{ width: `${negativePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <nav className="space-y-2">
              <Link
                href="/feedback"
                className="block rounded-lg border border-slate-800 px-4 py-3 text-sm text-slate-300 hover:border-violet-500 hover:bg-violet-500/5 transition"
              >
                💬 Manage Feedback
              </Link>
              <Link
                href="/themes"
                className="block rounded-lg border border-slate-800 px-4 py-3 text-sm text-slate-300 hover:border-violet-500 hover:bg-violet-500/5 transition"
              >
                🏷️ View Themes
              </Link>
              <Link
                href="/trends"
                className="block rounded-lg border border-slate-800 px-4 py-3 text-sm text-slate-300 hover:border-violet-500 hover:bg-violet-500/5 transition"
              >
                📈 Analyze Trends
              </Link>
              <Link
                href="/reports"
                className="block rounded-lg border border-slate-800 px-4 py-3 text-sm text-slate-300 hover:border-violet-500 hover:bg-violet-500/5 transition"
              >
                📄 View Reports
              </Link>
              {isAdmin && (
                <Link
                  href="/settings"
                  className="block rounded-lg border border-slate-800 px-4 py-3 text-sm text-slate-300 hover:border-violet-500 hover:bg-violet-500/5 transition"
                >
                  ⚙️ Settings
                </Link>
              )}
            </nav>
          </div>
        </section>

        {/* Recent Feedback */}
        <section className="card">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Feedback</h2>
            <Link href="/feedback" className="text-sm text-violet-400 hover:text-violet-300 transition">
              View all →
            </Link>
          </div>

          {recentFeedback.length === 0 ? (
            <EmptyState
              title="No feedback yet"
              description="Start collecting customer feedback to see it here."
              icon="📭"
            />
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((item) => (
                <FeedbackItem
                  key={item.id}
                  content={item.content}
                  channel={item.channel}
                  customerLabel={item.customerLabel || undefined}
                  status={item.status}
                  date={new Date(item.createdAt).toLocaleDateString()}
                  sentiment={item.sentiment || undefined}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
