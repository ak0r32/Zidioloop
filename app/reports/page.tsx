import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentSession } from "@/lib/session";

export default async function ReportsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  const reportTypes = [
    {
      id: "executive-summary",
      title: "Executive Summary",
      description: "High-level overview of feedback trends and key metrics",
      icon: "📊",
      status: "coming-soon",
      features: [
        "Total feedback volume",
        "Sentiment breakdown",
        "Top themes identified",
        "Key insights",
      ],
    },
    {
      id: "sentiment-analysis",
      title: "Sentiment Analysis",
      description: "Deep dive into customer sentiment patterns and trends",
      icon: "💭",
      status: "coming-soon",
      features: [
        "Sentiment over time",
        "Positive vs negative ratio",
        "Trending sentiment topics",
        "Segment comparison",
      ],
    },
    {
      id: "voice-of-customer",
      title: "Voice of Customer",
      description: "Aggregated customer themes and recurring feedback patterns",
      icon: "🗣️",
      status: "coming-soon",
      features: [
        "Theme breakdown",
        "Mention frequency",
        "Sentiment per theme",
        "Action recommendations",
      ],
    },
    {
      id: "competitive-analysis",
      title: "Competitive Analysis",
      description: "Compare feedback mentions with competitive benchmarks",
      icon: "⚔️",
      status: "coming-soon",
      features: [
        "Feature comparison",
        "Pricing perception",
        "Support satisfaction",
        "Market positioning",
      ],
    },
  ];

  const reportsGenerated = 0;

  return (
    <main className="min-h-screen pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                Reports
              </p>
              <h1 className="mt-2 text-5xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                Voice of Customer
              </h1>
              <p className="mt-2 text-slate-400">
                Generate comprehensive reports on customer feedback and insights
              </p>
            </div>
            {isAdmin && (
              <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/10 border border-violet-500/30 rounded-xl p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Reports Generated</p>
                <p className="text-4xl font-bold text-violet-300">{reportsGenerated}</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Reports */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Available Reports</h2>
            <p className="text-sm text-slate-400 mt-1">
              Generate detailed analysis and insights from your feedback
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                className="card group hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform">
                      {report.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {report.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 border-t border-slate-700/50 pt-4 mb-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Includes
                  </p>
                  <ul className="space-y-2">
                    {report.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        <span className="text-violet-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status Badge and Button */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Coming in M4
                  </span>
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-400 font-medium cursor-not-allowed opacity-50"
                  >
                    Generate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What You Can Do Section */}
        <section className="card bg-gradient-to-br from-violet-600/20 to-purple-600/10 border-violet-500/30">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span>💡</span> Upcoming Features
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span className="text-lg">📥</span> Export Options
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-violet-400">→</span>
                  Download as PDF with custom branding
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-400">→</span>
                  Export to CSV for further analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-400">→</span>
                  Share via email or secure link
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span className="text-lg">📋</span> Customization
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-violet-400">→</span>
                  Select which metrics to include
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-400">→</span>
                  Choose date ranges and filters
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-400">→</span>
                  Add your own insights and notes
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <p className="text-sm text-slate-300">
              <strong>Timeline:</strong> Reports functionality is coming in Milestone 4, 
              with PDF export, custom branding, and advanced analytics.
            </p>
          </div>
        </section>

        {/* In the meantime */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">In the meantime...</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/dashboard"
              className="card group hover:border-blue-500/50 transition-all"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                📊
              </div>
              <h3 className="text-white font-bold mb-1">View Dashboard</h3>
              <p className="text-sm text-slate-400">
                See real-time feedback metrics and trends
              </p>
            </Link>

            <Link
              href="/trends"
              className="card group hover:border-green-500/50 transition-all"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                📈
              </div>
              <h3 className="text-white font-bold mb-1">Explore Trends</h3>
              <p className="text-sm text-slate-400">
                Track feedback volume and sentiment over time
              </p>
            </Link>

            <Link
              href="/themes"
              className="card group hover:border-amber-500/50 transition-all"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                🏷️
              </div>
              <h3 className="text-white font-bold mb-1">Discover Themes</h3>
              <p className="text-sm text-slate-400">
                Identify patterns and categories in feedback
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
