import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/session";
import { EmptyState } from "@/components/dashboard";

export default async function AskLoopPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">AI-Powered</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Ask LOOP</h1>
          <p className="mt-1 text-sm text-slate-400">Ask natural language questions about your feedback</p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          <div className="card">
            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Your question</label>
                <textarea
                  disabled
                  placeholder="What are users saying about pricing?"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-300 placeholder-slate-500 outline-none opacity-50 disabled:cursor-not-allowed"
                  rows={4}
                />
              </div>
              <button
                type="button"
                disabled
                className="w-full rounded-lg bg-violet-600/50 px-4 py-2.5 font-semibold text-white opacity-50 disabled:cursor-not-allowed"
              >
                Search feedback
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-slate-800">
              <EmptyState
                title="No answer yet"
                description="Milestone 3: AI-powered Q&A with semantic search and grounded answers coming soon"
                icon="🤖"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
