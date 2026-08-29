import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentSession } from "@/lib/session";
import { EmptyState } from "@/components/dashboard";

export default async function ReportsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Reports</p>
              <h1 className="mt-2 text-4xl font-bold text-white">Voice of Customer</h1>
              <p className="mt-1 text-sm text-slate-400">Comprehensive feedback intelligence reports</p>
            </div>
            {isAdmin && (
              <button disabled className="px-4 py-2 rounded-lg bg-violet-600/50 text-white font-medium opacity-50 disabled:cursor-not-allowed">
                + Generate Report
              </button>
            )}
          </div>
        </div>

        <div className="card min-h-96">
          <EmptyState
            title="No reports yet"
            description="Milestone 4: Voice-of-Customer reports with PDF export and statistics coming soon"
            icon="📄"
          />
        </div>
      </div>
    </main>
  );
}
