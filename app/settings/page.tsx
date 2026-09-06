import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/session";
import { canManageMembers } from "@/lib/rbac";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = canManageMembers(session.user.role);

  const settingsTabs = [
    {
      id: "team",
      title: "Team Members",
      icon: "👥",
    },
    {
      id: "workspace",
      title: "Workspace",
      icon: "🏢",
    },
    {
      id: "permissions",
      title: "Permissions",
      icon: "🔐",
    },
    {
      id: "integrations",
      title: "Integrations",
      icon: "🔗",
    },
  ];

  return (
    <main className="min-h-screen pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
            Configuration
          </p>
          <h1 className="mt-2 text-5xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="mt-2 text-slate-400">Manage workspace, team, and permissions</p>
        </div>

        {isAdmin ? (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* Sidebar Navigation */}
            <div className="card h-fit">
              <h3 className="font-bold text-white mb-4">Settings Menu</h3>
              <div className="space-y-2">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className="w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-medium flex items-center gap-3"
                    disabled={tab.id !== "team"}
                    style={{
                      backgroundColor:
                        tab.id === "team"
                          ? "rgb(139, 92, 246, 0.2)"
                          : "transparent",
                      color:
                        tab.id === "team" ? "rgb(196, 181, 253)" : "rgb(148, 163, 184)",
                      opacity: tab.id === "team" ? 1 : 0.5,
                      cursor: tab.id === "team" ? "pointer" : "not-allowed",
                    }}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Team Members Section */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Team Members</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Manage who has access to your workspace
                    </p>
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg bg-violet-600/30 text-violet-300 font-medium opacity-60 cursor-not-allowed"
                  >
                    Add Member
                  </button>
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <div className="bg-gradient-to-br from-slate-900/50 to-slate-950/50 rounded-lg border border-slate-700/50 p-6 text-center">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Team Management Coming Soon
                    </h3>
                    <p className="text-slate-400 mb-4">
                      In Milestone 2, you'll be able to:
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300 max-w-sm mx-auto">
                      <li className="flex items-center gap-2">
                        <span className="text-violet-400">✓</span>
                        Invite team members via email
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-violet-400">✓</span>
                        Assign roles (Admin, Analyst, Viewer)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-violet-400">✓</span>
                        Remove members and manage permissions
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-violet-400">✓</span>
                        Track activity and access logs
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Workspace Settings */}
              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Workspace Information
                </h2>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Workspace Name
                      </p>
                      <p className="text-lg font-bold text-white">
                        {session.user.workspaceId}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Admin
                      </p>
                      <p className="text-lg font-bold text-white">
                        {session.user.name}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Email
                    </p>
                    <p className="text-lg font-bold text-white">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Role-Based Permissions */}
              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Role-Based Permissions
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      role: "ADMIN",
                      permissions: [
                        "Manage team members",
                        "View all feedback",
                        "Edit and delete feedback",
                        "Manage workspace settings",
                        "Generate reports",
                        "Access audit logs",
                      ],
                    },
                    {
                      role: "ANALYST",
                      permissions: [
                        "View all feedback",
                        "Create and edit feedback",
                        "Analyze themes and trends",
                        "Ask LOOP AI questions",
                        "Generate reports",
                      ],
                    },
                    {
                      role: "VIEWER",
                      permissions: [
                        "View feedback and insights",
                        "View themes and trends",
                        "Ask LOOP AI questions",
                      ],
                    },
                  ].map((roleItem) => (
                    <div
                      key={roleItem.role}
                      className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-violet-500/30 transition-colors"
                    >
                      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 text-sm">
                          {roleItem.role[0]}
                        </span>
                        {roleItem.role}
                      </h3>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {roleItem.permissions.map((perm) => (
                          <li
                            key={perm}
                            className="flex items-center gap-2 text-sm text-slate-300"
                          >
                            <span className="text-violet-400">✓</span>
                            {perm}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data & Privacy */}
              <div className="card border border-red-500/20 bg-red-500/5">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span>⚠️</span> Danger Zone
                </h2>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <h3 className="font-bold text-red-300 mb-2">Export Data</h3>
                    <p className="text-sm text-slate-400 mb-3">
                      Download all your feedback and workspace data in CSV format
                    </p>
                    <button
                      disabled
                      className="px-4 py-2 rounded-lg bg-red-600/30 text-red-300 font-medium opacity-60 cursor-not-allowed"
                    >
                      Export Data (Coming Soon)
                    </button>
                  </div>

                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <h3 className="font-bold text-red-300 mb-2">Delete Workspace</h3>
                    <p className="text-sm text-slate-400 mb-3">
                      Permanently delete this workspace and all associated data
                    </p>
                    <button
                      disabled
                      className="px-4 py-2 rounded-lg bg-red-600/30 text-red-300 font-medium opacity-60 cursor-not-allowed"
                    >
                      Delete Workspace (Coming Soon)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card max-w-2xl">
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Insufficient Permissions
              </h3>
              <p className="text-slate-400">
                Only workspace admins can access the settings page. Contact your admin for
                assistance.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
