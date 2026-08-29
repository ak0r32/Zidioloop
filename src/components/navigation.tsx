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
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/feedback", label: "Feedback", icon: "💬" },
    { href: "/themes", label: "Themes", icon: "🏷️" },
    { href: "/trends", label: "Trends", icon: "📈" },
    { href: "/ask-loop", label: "Ask LOOP", icon: "🤖" },
    { href: "/reports", label: "Reports", icon: "📄" },
    ...(isAdmin || isAnalyst ? [{ href: "/settings", label: "Settings", icon: "⚙️" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-600">
              LOOP
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm rounded-lg text-slate-300 hover:bg-slate-800 transition flex items-center gap-2"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right text-sm">
              <div className="font-medium text-white">{session.user.name}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">{session.user.role}</div>
            </div>

            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
              className="px-4 py-2 text-sm rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition"
            >
              Logout
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm rounded-lg text-slate-300 hover:bg-slate-800 transition"
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
