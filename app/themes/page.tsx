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

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Analyze</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Themes</h1>
          <p className="mt-1 text-sm text-slate-400">Patterns and categories in customer feedback</p>
        </div>

        {/* Stats Grid */}
        <section className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="card">
            <p className="text-sm text-slate-400">Total themes</p>
            <p className="mt-3 text-3xl font-bold text-white">{totalThemes}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400">Total mentions</p>
            <p className="mt-3 text-3xl font-bold text-white">{totalMentions}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400">Avg per theme</p>
            <p className="mt-3 text-3xl font-bold text-white">{avgMentionsPerTheme}</p>
          </div>
        </section>

        {/* Themes List */}
        <section className="card">
          <h2 className="text-lg font-semibold text-white mb-6">All Themes</h2>

          {enrichedThemes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No themes found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrichedThemes.map((theme) => (
                <div
                  key={theme.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {theme.color && (
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: theme.color }}
                      ></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{theme.name}</h3>
                      {theme.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{theme.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Mentions</span>
                      <span className="font-semibold text-white">{theme.feedbackCount}</span>
                    </div>

                    {/* Sentiment breakdown */}
                    <div className="space-y-1">
                      {theme.sentiments.POS > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-300">Positive</span>
                          <span className="text-green-300">{theme.sentiments.POS}</span>
                        </div>
                      )}
                      {theme.sentiments.NEU > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Neutral</span>
                          <span className="text-slate-400">{theme.sentiments.NEU}</span>
                        </div>
                      )}
                      {theme.sentiments.NEG > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-red-300">Negative</span>
                          <span className="text-red-300">{theme.sentiments.NEG}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                      style={{
                        width: `${theme.feedbackCount > 0 ? Math.min(100, (theme.feedbackCount / (totalMentions || 1)) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
