"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("Acme Customer Success");
  const [email, setEmail] = useState("team@acme.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to create account.");
      }

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="card space-y-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">Get started</p>
            <h1 className="mt-3 text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              LOOP
            </h1>
            <p className="mt-2 text-sm text-slate-400">Create your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                placeholder="your@company.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300 border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 font-semibold text-white transition hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating workspace..." : "Create workspace"}
            </button>
          </form>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center">You&apos;ll become the workspace admin</p>
            <p className="text-xs text-slate-400 text-center">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
