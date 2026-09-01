"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface Feedback {
  id: string;
  content: string;
  channel: string;
  customerLabel?: string;
  status: string;
  sentiment?: string;
  createdAt: string;
}

interface DayStats {
  date: string;
  day: string;
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  closed: number;
  items: Feedback[];
}

export default function AdminTicketsPage() {
  const { data: session, status } = useSession();
  const [dayStats, setDayStats] = useState<DayStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (status === "loading") {
    return <div className="mx-auto max-w-7xl px-4 py-8"><div className="card h-64 animate-pulse" /></div>;
  }

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/feedback?pageSize=1000");
      const data = await response.json();

      // Group by date
      const grouped: { [date: string]: Feedback[] } = {};
      const feedbackList = data.items || [];

      feedbackList.forEach((item: Feedback) => {
        const date = new Date(item.createdAt);
        const dateStr = date.toISOString().split("T")[0];
        
        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        grouped[dateStr].push(item);
      });

      // Create stats
      const stats: DayStats[] = Object.entries(grouped)
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
        .map(([date, items]) => {
          const dateObj = new Date(date + "T00:00:00Z");
          return {
            date,
            day: dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            total: items.length,
            positive: items.filter(i => i.sentiment === "POS").length,
            negative: items.filter(i => i.sentiment === "NEG").length,
            neutral: items.filter(i => i.sentiment === "NEU").length,
            closed: items.filter(i => i.status === "ACTIONED").length,
            items,
          };
        });

      setDayStats(stats);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const handleClassify = async (feedbackId: string, sentiment: "POS" | "NEG") => {
    setUpdatingId(feedbackId);
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentiment }),
      });

      if (response.ok) {
        await fetchTickets();
      }
    } catch (error) {
      console.error("Error classifying feedback:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClose = async (feedbackId: string) => {
    setUpdatingId(feedbackId);
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIONED" }),
      });

      if (response.ok) {
        await fetchTickets();
      }
    } catch (error) {
      console.error("Error closing feedback:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "POS":
        return "bg-green-500/10 text-green-300 border-green-500/30";
      case "NEG":
        return "bg-red-500/10 text-red-300 border-red-500/30";
      case "NEU":
        return "bg-slate-500/10 text-slate-300 border-slate-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Admin</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Tickets & Queries</h1>
          <p className="mt-1 text-sm text-slate-400">Manage feedback by day, classify sentiment, and close tickets</p>
        </div>

        {/* Summary Stats */}
        {dayStats.length > 0 && (
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="card">
              <p className="text-xs text-slate-400 mb-2">Total Feedback</p>
              <p className="text-2xl font-bold text-white">{dayStats.reduce((sum, d) => sum + d.total, 0)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-slate-400 mb-2">Positive</p>
              <p className="text-2xl font-bold text-green-400">{dayStats.reduce((sum, d) => sum + d.positive, 0)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-slate-400 mb-2">Negative</p>
              <p className="text-2xl font-bold text-red-400">{dayStats.reduce((sum, d) => sum + d.negative, 0)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-slate-400 mb-2">Closed</p>
              <p className="text-2xl font-bold text-slate-400">{dayStats.reduce((sum, d) => sum + d.closed, 0)}</p>
            </div>
          </div>
        )}

        {/* Day-wise Tickets */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card h-20 bg-slate-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : dayStats.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-slate-400 mb-2">No feedback found</p>
              <p className="text-sm text-slate-500">Start importing feedback to see it here</p>
            </div>
          ) : (
            dayStats.map((dayData) => (
              <div key={dayData.date} className="card">
                {/* Day Header - Click to Expand */}
                <button
                  onClick={() => toggleDay(dayData.date)}
                  className="w-full text-left p-4 hover:bg-slate-800/50 transition rounded-lg -m-4 p-4 mb-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div>
                        <p className="font-semibold text-white">{dayData.day}</p>
                        <p className="text-xs text-slate-400">{dayData.date}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 ml-auto">
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{dayData.total}</p>
                          <p className="text-xs text-slate-400">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-400">{dayData.positive}</p>
                          <p className="text-xs text-slate-400">Positive</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-red-400">{dayData.negative}</p>
                          <p className="text-xs text-slate-400">Negative</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-400">{dayData.closed}</p>
                          <p className="text-xs text-slate-400">Closed</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400">
                      {expandedDays.has(dayData.date) ? "▼" : "▶"}
                    </span>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedDays.has(dayData.date) && (
                  <div className="space-y-3 border-t border-slate-700 pt-4">
                    {dayData.items.map((item) => (
                      <div
                        key={item.id}
                        className="border border-slate-700 rounded-lg p-4 bg-slate-900/50 hover:bg-slate-900/70 transition"
                      >
                        <div className="flex flex-col gap-3">
                          {/* Content */}
                          <p className="text-sm text-slate-100">{item.content}</p>

                          {/* Metadata Row */}
                          <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-violet-400"></span>
                              {item.channel}
                              {item.customerLabel && (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <span className="font-medium text-slate-300">{item.customerLabel}</span>
                                </>
                              )}
                            </div>
                            <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>

                          {/* Actions Row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Sentiment Badges/Buttons */}
                            <div className="flex items-center gap-1">
                              {item.sentiment ? (
                                <span
                                  className={`text-[11px] font-semibold px-2 py-1 rounded border ${getSentimentColor(
                                    item.sentiment,
                                  )}`}
                                >
                                  {item.sentiment === "POS"
                                    ? "✓ Positive"
                                    : item.sentiment === "NEG"
                                      ? "✗ Negative"
                                      : "◐ Neutral"}
                                </span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleClassify(item.id, "POS")}
                                    disabled={updatingId === item.id}
                                    className="text-[11px] font-semibold px-2 py-1 rounded border border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/20 transition disabled:opacity-50"
                                  >
                                    👍 Positive
                                  </button>
                                  <button
                                    onClick={() => handleClassify(item.id, "NEG")}
                                    disabled={updatingId === item.id}
                                    className="text-[11px] font-semibold px-2 py-1 rounded border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
                                  >
                                    👎 Negative
                                  </button>
                                </>
                              )}
                            </div>

                            <div className="flex-1" />

                            {/* Status and Close */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-semibold px-2 py-1 rounded border ${
                                  item.status === "ACTIONED"
                                    ? "bg-green-500/10 text-green-300 border-green-500/30"
                                    : item.status === "REVIEWED"
                                      ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
                                      : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                                }`}
                              >
                                {item.status}
                              </span>

                              {item.status !== "ACTIONED" && (
                                <button
                                  onClick={() => handleClose(item.id)}
                                  disabled={updatingId === item.id}
                                  className="text-[11px] font-semibold px-2 py-1 rounded border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 transition disabled:opacity-50"
                                >
                                  ✓ Close
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
