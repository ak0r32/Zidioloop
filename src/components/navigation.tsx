"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function Navigation() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";
  const isAnalyst = session.user.role === "ANALYST";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊", color: "from-blue-500/20 to-blue-600/10" },
    { href: "/feedback", label: "Feedback", icon: "💬", color: "from-violet-500/20 to-violet-600/10" },
    { href: "/themes", label: "Themes", icon: "🏷️", color: "from-amber-500/20 to-amber-600/10" },
    { href: "/trends", label: "Trends", icon: "📈", color: "from-green-500/20 to-green-600/10" },
    { href: "/ask-loop", label: "Ask LOOP", icon: "🤖", color: "from-purple-500/20 to-purple-600/10" },
    { href: "/reports", label: "Reports", icon: "📄", color: "from-rose-500/20 to-rose-600/10" },
    ...(isAdmin ? [{ href: "/admin/tickets", label: "Tickets", icon: "🎫", color: "from-cyan-500/20 to-cyan-600/10" }] : []),
    ...(isAdmin || isAnalyst ? [{ href: "/settings", label: "Settings", icon: "⚙️", color: "from-slate-500/20 to-slate-600/10" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/80 via-slate-900/90 to-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300">
              <span className="text-base font-bold text-white">L</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold text-white">LOOP</span>
              <span className="text-xs text-slate-500">Feedback</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 hover:bg-gradient-to-r ${item.color} hover:border border-slate-600/50`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-slate-300 group-hover:text-white transition">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* User Info - Desktop */}
            <div className="hidden md:flex flex-col items-end text-sm">
              <div className="font-semibold text-white">{session.user.name}</div>
              <div className="text-xs font-bold text-violet-400 uppercase tracking-wider">{session.user.role}</div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
              className="hidden md:flex px-4 py-2 text-sm font-semibold rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 hover:border-red-400/50 transition-all duration-300"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
            >
              <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-slate-700/50 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="border-t border-slate-700/50 pt-4 mt-4">
              <div className="px-4 py-3 text-sm border-b border-slate-700/50 mb-3">
                <div className="font-semibold text-white">{session.user.name}</div>
                <div className="text-xs font-bold text-violet-400 uppercase tracking-wider">{session.user.role}</div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ redirect: true, callbackUrl: "/login" });
                }}
                className="w-full px-4 py-3 text-sm font-semibold rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 transition-all text-left"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
