import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export default async function ThemesPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

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
    orderBy: { id: "asc" },
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
    };
  });

  const totalThemes = enrichedThemes.length;
  const totalMentions = enrichedThemes.reduce((sum, t) => sum + t.feedbackCount, 0);
  const avgMentionsPerTheme = totalThemes > 0 ? Math.round(totalMentions / totalThemes) : 0;
  const mostMentioned = enrichedThemes.length > 0
    ? enrichedThemes.reduce((prev, curr) =>
        prev.feedbackCount > curr.feedbackCount ? prev : curr
      )
    : null;

  return (
    <main className="min-h-screen pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">Analyze</p>
          <h1 className="mt-2 text-5xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
            Themes & Patterns
          </h1>
          <p className="mt-2 text-slate-400">
            Discover recurring patterns and categories across your customer feedback
          </p>
        </div>

        {/* Stats Grid */}
        <section className="grid gap-6 md:grid-cols-3 mb-12">
          <div className="card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400">Total Themes</p>
              <span className="text-2xl">🏷️</span>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                {totalThemes}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {totalThemes === 0 ? "No themes yet" : `${totalThemes} unique categories`}
              </p>
            </div>
          </div>

          <div className="card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400">Total Mentions</p>
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                {totalMentions}
              </p>
              <p className="text-xs text-slate-500 mt-2">feedback items tagged</p>
            </div>
          </div>

          <div className="card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400">Avg per Theme</p>
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                {avgMentionsPerTheme}
              </p>
              <p className="text-xs text-slate-500 mt-2">items per category</p>
            </div>
          </div>
        </section>

        {/* Most Mentioned Theme */}
        {mostMentioned && (
          <section className="mb-12">
            <div className="card bg-gradient-to-br from-violet-600/20 to-purple-600/10 border-violet-500/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">🔥</div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
                    Most Discussed
                  </p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {mostMentioned.name}
                  </h3>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                {mostMentioned.description}
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-2">Mentions</p>
                  <p className="text-3xl font-bold text-white">
                    {mostMentioned.feedbackCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">Positive</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-300">
                      {mostMentioned.sentiments.POS}
                    </span>
                    <span className="text-xs text-green-400">
                      (
                      {mostMentioned.feedbackCount > 0
                        ? Math.round(
                            (mostMentioned.sentiments.POS /
                              mostMentioned.feedbackCount) *
                              100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">Negative</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-300">
                      {mostMentioned.sentiments.NEG}
                    </span>
                    <span className="text-xs text-red-400">
                      (
                      {mostMentioned.feedbackCount > 0
                        ? Math.round(
                            (mostMentioned.sentiments.NEG /
                              mostMentioned.feedbackCount) *
                              100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Themes List */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">All Themes</h2>
            <p className="text-sm text-slate-400 mt-1">
              Complete overview of all identified themes
            </p>
          </div>

          {enrichedThemes.length === 0 ? (
            <div className="card py-16 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-white mb-2">No themes identified yet</h3>
              <p className="text-slate-400">
                Themes will appear as you add and categorize feedback
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrichedThemes.map((theme, index) => {
                const positivePercentage = theme.feedbackCount > 0
                  ? Math.round((theme.sentiments.POS / theme.feedbackCount) * 100)
                  : 0;
                const negativePercentage = theme.feedbackCount > 0
                  ? Math.round((theme.sentiments.NEG / theme.feedbackCount) * 100)
                  : 0;

                return (
                  <div
                    key={theme.id}
                    className="card group hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer"
                  >
                    {/* Header with Color */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: theme.color
                            ? `${theme.color}20`
                            : `rgb(139, 92, 246, 0.2)`,
                          borderColor: theme.color
                            ? `${theme.color}50`
                            : `rgb(139, 92, 246, 0.5)`,
                          borderWidth: "1px",
                        }}
                      >
                        {String.fromCharCode(65 + (index % 26))}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate text-lg">
                          {theme.name}
                        </h3>
                        {theme.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {theme.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-4 border-t border-slate-700/50 pt-4">
                      {/* Mentions Count */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-300">
                            Mentions
                          </span>
                          <span className="text-2xl font-bold text-violet-300">
                            {theme.feedbackCount}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                            style={{
                              width: `${
                                theme.feedbackCount > 0
                                  ? Math.min(
                                      100,
                                      (theme.feedbackCount / (totalMentions || 1)) *
                                        100
                                    )
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Sentiment Distribution */}
                      <div>
                        <p className="text-xs font-semibold text-slate-400 mb-3">
                          Sentiment Distribution
                        </p>
                        <div className="space-y-2">
                          {theme.sentiments.POS > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">😊</span>
                                <span className="text-sm text-green-300">
                                  Positive
                                </span>
                              </div>
                              <span className="text-sm font-bold text-green-300">
                                {theme.sentiments.POS} (
                                {positivePercentage}%)
                              </span>
                            </div>
                          )}
                          {theme.sentiments.NEU > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">😐</span>
                                <span className="text-sm text-slate-300">
                                  Neutral
                                </span>
                              </div>
                              <span className="text-sm font-bold text-slate-300">
                                {theme.sentiments.NEU} (
                                {100 -
                                  positivePercentage -
                                  negativePercentage}
                                %)
                              </span>
                            </div>
                          )}
                          {theme.sentiments.NEG > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">😞</span>
                                <span className="text-sm text-red-300">
                                  Negative
                                </span>
                              </div>
                              <span className="text-sm font-bold text-red-300">
                                {theme.sentiments.NEG} (
                                {negativePercentage}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
