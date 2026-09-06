"use client";

import Link from "next/link";
import { StatCard, FeedbackItem, EmptyState } from "@/components/dashboard";
import { Onboarding, useOnboardingState } from "@/components/onboarding";

type DashboardPropsClient = {
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

export function DashboardWithOnboarding({
  session,
  isAdmin,
  isAnalyst,
  totalFeedback,
  weeklyFeedback,
  posCount,
  neuCount,
  negativeCount,
  negativePercentage,
  totalThemes,
  recentFeedback,
}: DashboardPropsClient) {
  const { showOnboarding, setShowOnboarding, isLoaded } = useOnboardingState();

  if (!isLoaded) return null;

  return (
    <>
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}

      <main className="min-h-screen pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12">
          {/* Header Section */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                  Welcome back
                </p>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                  {session.user.name}
                </h1>
                <p className="text-sm text-slate-400 font-medium">
                  <span className="text-slate-300">{session.user.role}</span> •{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {(isAdmin || isAnalyst) && (
                  <Link
                    href="/feedback"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold hover:from-violet-500 hover:to-violet-400 transition-all duration-300 shadow-lg shadow-violet-500/20 flex items-center gap-2 hover:shadow-violet-500/40"
                  >
                    <span>➕</span> Add Feedback
                  </Link>
                )}
                <Link
                  href="/ask-loop"
                  className="px-6 py-3 rounded-xl border-2 border-violet-500/50 bg-violet-500/10 text-violet-300 font-semibold hover:border-violet-400 hover:bg-violet-500/20 transition-all duration-300 flex items-center gap-2"
                >
                  <span>🤖</span> Ask LOOP
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <StatCard
              label="Total Feedback"
              value={totalFeedback}
              icon="💬"
              color="violet"
              trend={{ value: 24, direction: "up" }}
            />
            <StatCard
              label="This Week"
              value={weeklyFeedback}
              icon="📅"
              color="blue"
            />
            <StatCard
              label="Positive Rate"
              value={`${totalFeedback > 0 ? Math.round((posCount / totalFeedback) * 100) : 0}%`}
              icon="😊"
              color="green"
            />
            <StatCard
              label="Active Themes"
              value={totalThemes}
              icon="🏷️"
              color="amber"
            />
          </section>

          {/* Main Content Grid */}
          <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr] mb-12">
            {/* Sentiment Analytics */}
            <div className="card">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">
                  Sentiment Breakdown
                </h2>
                <p className="text-sm text-slate-400">
                  Customer feedback analysis over time
                </p>
              </div>

              <div className="space-y-6">
                {/* Positive */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <p className="text-sm font-semibold text-green-300">
                          Positive
                        </p>
                        <p className="text-xs text-slate-500">
                          Satisfied customers
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-green-300">
                      {posCount}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{
                        width: `${totalFeedback > 0 ? (posCount / totalFeedback) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {totalFeedback > 0
                      ? Math.round((posCount / totalFeedback) * 100)
                      : 0}
                    % of total
                  </p>
                </div>

                {/* Neutral */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">◐</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-300">
                          Neutral
                        </p>
                        <p className="text-xs text-slate-500">Mixed feedback</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-slate-300">
                      {neuCount}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-400 transition-all duration-500"
                      style={{
                        width: `${totalFeedback > 0 ? (neuCount / totalFeedback) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {totalFeedback > 0
                      ? Math.round((neuCount / totalFeedback) * 100)
                      : 0}
                    % of total
                  </p>
                </div>

                {/* Negative */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✗</span>
                      <div>
                        <p className="text-sm font-semibold text-red-300">
                          Negative
                        </p>
                        <p className="text-xs text-slate-500">
                          Needs attention
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-red-300">
                      {negativeCount}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-500"
                      style={{ width: `${negativePercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {negativePercentage}% of total
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-4">
              <div className="card">
                <h3 className="text-lg font-bold text-white mb-4">
                  Quick Access
                </h3>
                <nav className="space-y-2">
                  <Link
                    href="/feedback"
                    className="group flex items-center gap-3 rounded-xl border border-slate-700/50 px-4 py-3 text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      💬
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold group-hover:text-white transition">
                        Manage Feedback
                      </p>
                      <p className="text-xs text-slate-500">View and organize</p>
                    </div>
                    <span className="text-slate-500 group-hover:text-violet-400">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/themes"
                    className="group flex items-center gap-3 rounded-xl border border-slate-700/50 px-4 py-3 text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      🏷️
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold group-hover:text-white transition">
                        View Themes
                      </p>
                      <p className="text-xs text-slate-500">Categorized topics</p>
                    </div>
                    <span className="text-slate-500 group-hover:text-violet-400">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/trends"
                    className="group flex items-center gap-3 rounded-xl border border-slate-700/50 px-4 py-3 text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      📈
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold group-hover:text-white transition">
                        Analyze Trends
                      </p>
                      <p className="text-xs text-slate-500">Patterns & insights</p>
                    </div>
                    <span className="text-slate-500 group-hover:text-violet-400">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/reports"
                    className="group flex items-center gap-3 rounded-xl border border-slate-700/50 px-4 py-3 text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      📄
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold group-hover:text-white transition">
                        View Reports
                      </p>
                      <p className="text-xs text-slate-500">Comprehensive data</p>
                    </div>
                    <span className="text-slate-500 group-hover:text-violet-400">
                      →
                    </span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/tickets"
                      className="group flex items-center gap-3 rounded-xl border border-slate-700/50 px-4 py-3 text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">
                        🎫
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold group-hover:text-white transition">
                          Manage Tickets
                        </p>
                        <p className="text-xs text-slate-500">Admin panel</p>
                      </div>
                      <span className="text-slate-500 group-hover:text-violet-400">
                        →
                      </span>
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          </section>

          {/* Recent Feedback Section */}
          <section className="card">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Recent Feedback
                </h2>
                <p className="text-sm text-slate-400">
                  Latest customer submissions
                </p>
              </div>
              <Link
                href="/feedback"
                className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition flex items-center gap-2"
              >
                View all <span>→</span>
              </Link>
            </div>

            {recentFeedback.length === 0 ? (
              <EmptyState
                title="No feedback yet"
                description="Start collecting customer feedback to see insights and analytics here"
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
    </>
  );
}
