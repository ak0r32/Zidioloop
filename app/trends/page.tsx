"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentSession } from "@/lib/session";
import { VolumeChart, SentimentChart, ThemesChart } from "@/components/charts";

interface ChartData {
  date: string;
  [key: string]: string | number;
}

export default function TrendsPage() {
  const [volumeData, setVolumeData] = useState<ChartData[]>([]);
  const [sentimentData, setSentimentData] = useState<ChartData[]>([]);
  const [themesData, setThemesData] = useState<ChartData[]>([]);
  const [topThemes, setTopThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [volumeRes, sentimentRes, themesRes] = await Promise.all([
          fetch("/api/trends?type=volume"),
          fetch("/api/trends?type=sentiment"),
          fetch("/api/trends?type=themes"),
        ]);

        const volumeJson = await volumeRes.json();
        const sentimentJson = await sentimentRes.json();
        const themesJson = await themesRes.json();

        setVolumeData(volumeJson.data || []);
        setSentimentData(sentimentJson.data || []);
        setThemesData(themesJson.data || []);
        setTopThemes(themesJson.topThemes || []);
      } catch (error) {
        console.error("Error fetching trends data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen pb-20">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-800 rounded-lg w-48"></div>
            <div className="h-80 bg-slate-800 rounded-lg"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Insights</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Trends & Analysis</h1>
          <p className="mt-1 text-sm text-slate-400">Track patterns in feedback over time</p>
        </div>

        <div className="grid gap-6">
          {/* Feedback Volume */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Feedback Volume (Last 60 Days)</h2>
            {volumeData.length > 0 ? (
              <VolumeChart data={volumeData} />
            ) : (
              <div className="flex items-center justify-center h-80 text-slate-400">
                No data available
              </div>
            )}
          </div>

          {/* Sentiment Trends */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Sentiment Over Time</h2>
            {sentimentData.length > 0 ? (
              <SentimentChart data={sentimentData} />
            ) : (
              <div className="flex items-center justify-center h-80 text-slate-400">
                No data available
              </div>
            )}
          </div>

          {/* Theme Trends */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Top Themes Over Time</h2>
            {themesData.length > 0 ? (
              <ThemesChart data={themesData} topThemes={topThemes} />
            ) : (
              <div className="flex items-center justify-center h-80 text-slate-400">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
