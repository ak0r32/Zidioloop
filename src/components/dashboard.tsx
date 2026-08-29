"use client";

import { useSession } from "next-auth/react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: { value: number; direction: "up" | "down" };
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend.direction === "up"
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
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
    POS: "bg-green-500/10 text-green-300 border-green-500/30",
    NEG: "bg-red-500/10 text-red-300 border-red-500/30",
    NEU: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  };

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-500/10 text-blue-300",
    REVIEWED: "bg-yellow-500/10 text-yellow-300",
    ACTIONED: "bg-green-500/10 text-green-300",
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2 hover:border-slate-700 transition">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-100 line-clamp-2 flex-1">{content}</p>
        <div className="flex items-center gap-2">
          {sentiment && (
            <span className={`text-[10px] font-semibold px-2 py-1 rounded border ${sentimentColors[sentiment]}`}>
              {sentiment}
            </span>
          )}
          <span className={`text-[10px] font-semibold px-2 py-1 rounded ${statusColors[status]}`}>
            {status}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-violet-400"></span>
          {channel}
        </div>
        <div className="flex items-center gap-2">
          {customerLabel && <span>{customerLabel}</span>}
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-5xl mb-3">{icon}</span>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}
