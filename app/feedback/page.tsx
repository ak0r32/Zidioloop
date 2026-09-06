"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FeedbackFormModal, FeedbackFormData } from "@/components/feedback-form-modal";
import { FilterBadge, Dropdown, DropdownItem, DropdownDivider } from "@/components/dropdown";
import { Button, TextInput, Badge } from "@/components/form";
import { FeedbackItem } from "@/components/dashboard";

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
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

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
      if (sentimentFilter) params.append("sentiment", sentimentFilter);

      const response = await fetch(`/api/feedback?${params}`);
      const data: FeedbackResponse = await response.json();

      setFeedback(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  }, [channelFilter, page, pageSize, search, statusFilter, sentimentFilter]);

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

  const handleFormSubmit = async (formData: FeedbackFormData) => {
    setIsFormLoading(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create feedback");
      }

      await fetchFeedback();
      setIsFormOpen(false);
    } catch (error) {
      throw error;
    } finally {
      setIsFormLoading(false);
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

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("");
    setChannelFilter("");
    setSentimentFilter("");
    setPage(1);
  };

  const hasFilters = search || statusFilter || channelFilter || sentimentFilter;
  const totalPages = Math.ceil(total / pageSize);
  const channels = ["email", "chat", "phone", "twitter", "review", "survey"];
  const statuses = ["NEW", "REVIEWED", "ACTIONED"];
  const sentiments = ["POS", "NEU", "NEG"];

  return (
    <main className="min-h-screen pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">Organize</p>
              <h1 className="mt-2 text-5xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                Feedback Inbox
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                <span className="font-semibold text-slate-300">{total}</span> total items
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {(isAdmin || isAnalyst) && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.xlsx,.xls,text/csv,application/json"
                    className="hidden"
                    onChange={handleImport}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                  >
                    📥 {isImporting ? "Importing..." : "Import"}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setIsFormOpen(true)}
                  >
                    ➕ Add Feedback
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {importMessage && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm border backdrop-blur-xl ${
            importMessage.includes("success")
              ? "bg-green-500/15 border-green-500/30 text-green-300"
              : "bg-red-500/15 border-red-500/30 text-red-300"
          }`}>
            <div className="flex items-center gap-2">
              <span>{importMessage.includes("success") ? "✓" : "⚠"}</span>
              {importMessage}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="card">
            <div className="flex gap-3 flex-col md:flex-row">
              <TextInput
                icon="🔍"
                type="text"
                placeholder="Search feedback by content, customer, channel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button variant="primary" type="submit" size="md">
                Search
              </Button>
            </div>
          </form>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-medium">Filters:</span>
            {statusFilter && (
              <FilterBadge
                label="Status"
                value={statusFilter}
                onRemove={() => setStatusFilter("")}
              />
            )}
            {channelFilter && (
              <FilterBadge
                label="Channel"
                value={channelFilter}
                onRemove={() => setChannelFilter("")}
              />
            )}
            {sentimentFilter && (
              <FilterBadge
                label="Sentiment"
                value={sentimentFilter}
                onRemove={() => setSentimentFilter("")}
              />
            )}
            {hasFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs px-3 py-1 rounded-full bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Feedback List */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="card h-20 bg-gradient-to-r from-slate-800 to-slate-900 animate-pulse"
                  />
                ))}
              </div>
            ) : feedback.length === 0 ? (
              <div className="card py-16 text-center">
                <div className="text-5xl mb-4">🔄</div>
                <h3 className="text-xl font-bold text-white mb-2">No feedback found</h3>
                <p className="text-slate-400">
                  {hasFilters
                    ? "Try adjusting your filters or search query"
                    : "Start by adding or importing feedback"}
                </p>
              </div>
            ) : (
              <>
                {feedback.map((item) => (
                  <div key={item.id} className="group">
                    <FeedbackItem
                      content={item.content}
                      channel={item.channel}
                      customerLabel={item.customerLabel}
                      status={item.status}
                      date={new Date(item.createdAt).toLocaleDateString()}
                      sentiment={item.sentiment}
                    />
                    {(isAdmin || isAnalyst) && (
                      <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dropdown
                          trigger={
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={updatingId === item.id}
                            >
                              {updatingId === item.id ? "..." : "Update Status"} ▼
                            </Button>
                          }
                        >
                          {statuses.map((status) => (
                            <DropdownItem
                              key={status}
                              label={status}
                              onClick={() => handleStatusChange(item.id, status)}
                            />
                          ))}
                        </Dropdown>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  ← Previous
                </Button>
                <span className="text-sm text-slate-300 font-medium">
                  Page <span className="text-violet-300">{page}</span> of{" "}
                  <span className="text-violet-300">{totalPages}</span>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar Filters */}
          <div className="space-y-4">
            {/* Quick Filters */}
            <div className="card">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>⚙️</span> Quick Filters
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </label>
                  <div className="space-y-2">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(statusFilter === status ? "" : status);
                          setPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          statusFilter === status
                            ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                            : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {status === "NEW" && "🆕"}
                        {status === "REVIEWED" && "👀"}
                        {status === "ACTIONED" && "✓"}
                        {" " + status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-3">
                  <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Sentiment
                  </label>
                  <div className="space-y-2">
                    {sentiments.map((sentiment) => (
                      <button
                        key={sentiment}
                        onClick={() => {
                          setSentimentFilter(sentimentFilter === sentiment ? "" : sentiment);
                          setPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          sentimentFilter === sentiment
                            ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                            : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {sentiment === "POS" && "😊"}
                        {sentiment === "NEU" && "😐"}
                        {sentiment === "NEG" && "😞"}
                        {" " + sentiment}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-3">
                  <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Channel
                  </label>
                  <div className="space-y-2">
                    {channels.map((channel) => (
                      <button
                        key={channel}
                        onClick={() => {
                          setChannelFilter(channelFilter === channel ? "" : channel);
                          setPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          channelFilter === channel
                            ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                            : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="card">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>📊</span> Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Total Items</span>
                  <Badge variant="info">{total}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Page Size</span>
                  <Badge variant="info">{pageSize}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Current Page</span>
                  <Badge variant="info">
                    {page} of {totalPages || 1}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Feedback Modal */}
      <FeedbackFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />
    </main>
  );
}
