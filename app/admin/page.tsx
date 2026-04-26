"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // Redirect if already authenticated as admin
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setChecking(false); return; }
      const res = await fetch("/api/admin/auth", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) router.replace("/admin/dashboard");
      else setChecking(false);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // Verify this user is the configured admin
      const res = await fetch("/api/admin/auth", {
        headers: { Authorization: `Bearer ${data.session?.access_token}` },
      });
      if (!res.ok) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }
      router.replace("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="fixed inset-0 z-[200] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Checking session…</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm shadow-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 mb-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#003399", color: "#FFD700" }}>
              EU
            </div>
            <span className="font-bold text-gray-900">UA Admin</span>
          </div>
          <p className="text-sm text-gray-500">Ukrainian Art CMS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm font-medium text-white rounded transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#003399" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
