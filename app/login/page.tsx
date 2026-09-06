"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@demo.loop");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Pre-login Info Text */}
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">Access Your Workspace</p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-400 font-medium">Manage customer feedback with intelligence</p>
        </div>

        {/* Main Card */}
        <div className="card space-y-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="relative w-full rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur px-5 py-3 text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Password</label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="relative w-full rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur px-5 py-3 text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300 border border-red-500/30 backdrop-blur-sm font-medium">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </div>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-purple-600 px-6 py-3.5 font-bold text-white transition-all duration-300 hover:from-violet-500 hover:via-violet-400 hover:to-purple-500 hover:shadow-2xl hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" style={{ animation: 'none' }}></span>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span>→</span>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-gradient-to-br from-slate-900/80 to-slate-950/80 text-slate-500">Demo Account</span>
            </div>
          </div>

          {/* Demo Info */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-2 backdrop-blur-sm">
            <p className="text-xs font-semibold text-slate-300">Quick Access - Pre-filled credentials:</p>
            <div className="grid gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">📧</span>
                <code className="font-mono text-slate-300">admin@demo.loop</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">🔑</span>
                <code className="font-mono text-slate-300">demo1234</code>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center space-y-4">
          <p className="text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-violet-400 hover:text-violet-300 transition duration-300 inline-flex items-center gap-1">
              Create workspace
              <span>→</span>
            </Link>
          </p>
          <p className="text-xs text-slate-500 font-medium">Close the loop on customer feedback</p>
        </div>
      </div>
    </main>
  );
}
