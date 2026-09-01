"use client";

import { useState } from "react";

import { EmptyState } from "@/components/dashboard";

const suggestedQuestions = [
  "What are customers saying about pricing?",
  "What bugs or issues are people reporting?",
  "Are customers happy with support?",
  "What channels have the most negative feedback?",
  "What do people like most about the product?",
];

export default function AskLoopPage() {
  const [question, setQuestion] = useState("What are users saying about pricing?");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askQuestion = async (nextQuestion?: string) => {
    const trimmed = (nextQuestion ?? question).trim();

    if (!trimmed) {
      setError("Please enter a question.");
      return;
    }

    setQuestion(trimmed);
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch("/api/ask-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to get an answer.");
      }

      setAnswer(data.answer || "No answer returned.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await askQuestion();
  };

  const handleDownloadReport = () => {
    if (!answer) {
      return;
    }

    const report = `LOOP Analysis Report
Generated at: ${new Date().toISOString()}

Question:
${question}

Answer:
${answer}
`;

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `loop-analysis-report-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">AI-Powered</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Ask LOOP</h1>
          <p className="mt-1 text-sm text-slate-400">Ask natural language questions about your feedback</p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          <div className="card">
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Suggested questions</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => askQuestion(suggestion)}
                    className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200 transition hover:bg-violet-500/20"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Your question</label>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="What are users saying about pricing?"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500"
                  rows={4}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Analyzing feedback..." : "Search feedback"}
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-800">
              {answer ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-violet-500/30 bg-slate-950/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">Answer</p>
                      <button
                        type="button"
                        onClick={handleDownloadReport}
                        className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20"
                      >
                        Download analysis report
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{answer}</p>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No answer yet"
                  description="Ask about pricing, bugs, support, usability, or delivery trends in your imported feedback."
                  icon="🤖"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
