"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Feedback {
  id: string;
  content: string;
  channel: string;
  customerLabel?: string;
  status: string;
  sentiment?: string;
  createdAt: string;
}

interface FeedbackResponse {
  items: Feedback[];
  total: number;
  page: number;
  pageSize: number;
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><div className="card h-64 animate-pulse" /></div>}>
      <FeedbackInbox />
    </Suspense>
  );
}

function FeedbackInbox() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [channelFilter, setChannelFilter] = useState(searchParams.get("channel") || "");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  const isAdmin = session?.user.role === "ADMIN";
  const isAnalyst = session?.user.role === "ANALYST";

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (channelFilter) params.append("channel", channelFilter);

      const response = await fetch(`/api/feedback?${params}`);
      const data: FeedbackResponse = await response.json();

      setFeedback(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  }, [channelFilter, page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleStatusChange = async (feedbackId: string, newStatus: string) => {
    setUpdatingId(feedbackId);
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setFeedback(
          feedback.map((item) =>
            item.id === feedbackId ? { ...item, status: newStatus } : item,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (statusFilter) params.append("status", statusFilter);
    if (channelFilter) params.append("channel", channelFilter);
    router.push(`/feedback?${params}`);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);
    setImportMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/feedback/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Import failed");
      }

      setImportMessage(data.message || "CSV imported successfully.");
      await fetchFeedback();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to import CSV file";
      setImportMessage(message);
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const channels = ["Email", "Chat", "Support", "Twitter", "NPS Survey", "App Store", "ProductHunt"];
  const statuses = ["NEW", "REVIEWED", "ACTIONED"];

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Organize</p>
              <h1 className="mt-2 text-4xl font-bold text-white">Feedback Inbox</h1>
              <p className="mt-1 text-sm text-slate-400">{total} total feedback items</p>
            </div>
            {(isAdmin || isAnalyst) && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.xlsx,.xls,text/csv,application/json"
                  className="hidden"
                  onChange={handleImport}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-500 transition flex items-center gap-2 w-fit disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isImporting ? "⏳ Importing..." : "⬆️ Import CSV"}
                </button>
              </>
            )}
          </div>
        </div>

        {importMessage && (
          <div className="mb-4 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">
            {importMessage}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          {/* Main Inbox */}
          <div className="space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="card">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-500 transition"
                >
                  🔍
                </button>
              </div>
            </form>

            {/* Feedback List */}
            <div className="card space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-800 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : feedback.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400 mb-2">No feedback found</p>
                  <p className="text-sm text-slate-500">Try adjusting your filters or search query</p>
                </div>
              ) : (
                <>
                  {feedback.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <p className="text-sm text-slate-100 flex-1">{item.content}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.sentiment && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-1 rounded border ${
                                item.sentiment === "POS"
                                  ? "bg-green-500/10 text-green-300 border-green-500/30"
                                  : item.sentiment === "NEG"
                                    ? "bg-red-500/10 text-red-300 border-red-500/30"
                                    : "bg-slate-500/10 text-slate-300 border-slate-500/30"
                              }`}
                            >
                              {item.sentiment}
                            </span>
                          )}

                          {(isAdmin || isAnalyst) && (
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              disabled={updatingId === item.id}
                              className={`text-[10px] font-semibold px-2 py-1 rounded border-none cursor-pointer ${
                                item.status === "NEW"
                                  ? "bg-blue-500/10 text-blue-300"
                                  : item.status === "REVIEWED"
                                    ? "bg-yellow-500/10 text-yellow-300"
                                    : "bg-green-500/10 text-green-300"
                              } disabled:opacity-50`}
                            >
                              <option value="NEW">NEW</option>
                              <option value="REVIEWED">REVIEWED</option>
                              <option value="ACTIONED">ACTIONED</option>
                            </select>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-violet-400"></span>
                          {item.channel}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.customerLabel && <span className="font-medium">{item.customerLabel}</span>}
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card flex items-center justify-between">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-lg border border-slate-700 text-sm text-slate-300 hover:border-violet-500 disabled:opacity-50"
                >
                  ← Previous
                </button>
                <span className="text-sm text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-lg border border-slate-700 text-sm text-slate-300 hover:border-violet-500 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Filters */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-white mb-3">Filters</h3>

              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">Channel</label>
                  <select
                    value={channelFilter}
                    onChange={(e) => {
                      setChannelFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none focus:border-violet-500"
                  >
                    <option value="">All channels</option>
                    {channels.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none focus:border-violet-500"
                  >
                    <option value="">All statuses</option>
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {(isAdmin || isAnalyst) && (
              <div className="card">
                <h3 className="font-semibold text-white mb-3">Actions</h3>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 rounded-lg border border-violet-500/50 text-sm text-violet-300 hover:bg-violet-500/10 transition"
                >
                  ➕ Add feedback
                </button>
              </div>
            )}

            <div className="card">
              <h3 className="font-semibold text-white mb-3">Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total items</span>
                  <span className="font-semibold text-white">{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Page size</span>
                  <span className="font-semibold text-white">{pageSize}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
