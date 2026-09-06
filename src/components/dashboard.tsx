"use client";

import { useSession } from "next-auth/react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: { value: number; direction: "up" | "down" };
  color?: "violet" | "green" | "red" | "blue" | "amber";
}

const colorStyles = {
  violet: "from-violet-500/20 to-violet-600/10 border-violet-500/30 hover:border-violet-400/50",
  green: "from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400/50",
  red: "from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-400/50",
  blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/50",
  amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400/50",
};

export function StatCard({ label, value, icon, trend, color = "violet" }: StatCardProps) {
  return (
    <div
      className={`group rounded-2xl p-6 border bg-gradient-to-br backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-${color}-500/20 ${colorStyles[color]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md ${
              trend.direction === "up"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-red-500/20 text-red-300 border border-red-500/30"
            }`}
          >
            {trend.direction === "up" ? <span>↑</span> : <span>↓</span>}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-slate-400 mb-2">{label}</p>
      <p className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
        {value}
      </p>
    </div>
  );
}

interface FeedbackItemProps {
  content: string;
  channel: string;
  customerLabel?: string;
  status: string;
  date: string;
  sentiment?: string;
}

export function FeedbackItem({
  content,
  channel,
  customerLabel,
  status,
  date,
  sentiment,
}: FeedbackItemProps) {
  const sentimentColors: Record<string, string> = {
    POS: "bg-green-500/20 text-green-300 border border-green-500/40 font-semibold",
    NEG: "bg-red-500/20 text-red-300 border border-red-500/40 font-semibold",
    NEU: "bg-slate-500/20 text-slate-300 border border-slate-500/40 font-semibold",
  };

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold",
    REVIEWED: "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold",
    ACTIONED: "bg-green-500/20 text-green-300 border border-green-500/30 font-semibold",
  };

  return (
    <div className="group rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-950/30 p-5 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-950/20 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-200 line-clamp-2 flex-1 font-medium">{content}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {sentiment && (
            <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${sentimentColors[sentiment]}`}>
              {sentiment === "POS" ? "✓ Positive" : sentiment === "NEG" ? "✗ Negative" : "◐ Neutral"}
            </span>
          )}
          <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${statusColors[status]}`}>
            {status}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-purple-400"></span>
          <span className="text-slate-300">{channel}</span>
        </div>
        <div className="flex items-center gap-3">
          {customerLabel && <span className="text-slate-300 font-5">{customerLabel}</span>}
          <span className="text-slate-500">{date}</span>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4 opacity-60 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm">{description}</p>
    </div>
  );
}
