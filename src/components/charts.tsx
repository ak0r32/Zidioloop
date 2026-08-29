"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

interface ChartData {
  date: string;
  [key: string]: string | number;
}

export function VolumeChart({ data }: { data: ChartData[] }) {
  return (
    <div className="w-full h-80 bg-slate-950/30 rounded-lg border border-slate-800 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVolume)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SentimentChart({ data }: { data: ChartData[] }) {
  return (
    <div className="w-full h-80 bg-slate-950/30 rounded-lg border border-slate-800 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Legend wrapperStyle={{ color: "#94a3b8" }} />
          <Line type="monotone" dataKey="POS" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="NEU" stroke="#64748b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="NEG" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ThemesChart({ data, topThemes }: { data: ChartData[]; topThemes: string[] }) {
  const colors = ["#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className="w-full h-80 bg-slate-950/30 rounded-lg border border-slate-800 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Legend wrapperStyle={{ color: "#94a3b8" }} />
          {topThemes.map((theme, idx) => (
            <Bar key={theme} dataKey={theme} fill={colors[idx % colors.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
