import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/session";
import { EmptyState } from "@/components/dashboard";
import { canManageMembers } from "@/lib/rbac";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = canManageMembers(session.user.role);

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Configuration</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">Manage workspace and members</p>
        </div>

        {isAdmin ? (
          <div className="grid gap-6 max-w-2xl">
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Team Members</h2>
              <EmptyState
                title="Members feature"
                description="Milestone 2: Add members, assign roles, and manage workspace permissions coming soon"
                icon="👥"
              />
            </div>
          </div>
        ) : (
          <div className="card max-w-2xl">
            <EmptyState
              title="Insufficient permissions"
              description="Only workspace admins can access settings"
              icon="🔒"
            />
          </div>
        )}
      </div>
    </main>
  );
}
