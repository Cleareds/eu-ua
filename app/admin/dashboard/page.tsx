"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

interface Stats { waves: number; artists: number; artObjects: number; }

export default function DashboardPage() {
  const { adminFetch, state } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (state !== "authenticated") return;
    Promise.all([
      adminFetch("/api/admin/art-waves").then(r => r.json()),
      adminFetch("/api/admin/art-artists").then(r => r.json()),
      adminFetch("/api/admin/art-objects").then(r => r.json()),
    ]).then(([waves, artists, objects]) => {
      setStats({
        waves: Array.isArray(waves) ? waves.length : 0,
        artists: Array.isArray(artists) ? artists.length : 0,
        artObjects: Array.isArray(objects) ? objects.length : 0,
      });
    });
  }, [state, adminFetch]);

  return (
    <AdminShell title="Dashboard">
      <div className="space-y-6 max-w-3xl">
        <p className="text-sm text-gray-500">
          Welcome to the Ukrainian Art CMS. Manage art objects, artists, and art movements below.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Movements", count: stats?.waves, href: "/admin/waves", color: "#003399" },
            { label: "Artists", count: stats?.artists, href: "/admin/artists", color: "#1A1A2E" },
            { label: "Art Objects", count: stats?.artObjects, href: "/admin/art", color: "#8B5CF6" },
          ].map(s => (
            <Link
              key={s.href}
              href={s.href}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>
                {stats === null ? "…" : s.count}
              </div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Add</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "New Art Object", href: "/admin/art/new", icon: "🖼" },
              { label: "New Artist", href: "/admin/artists/new", icon: "👤" },
              { label: "New Movement", href: "/admin/waves/new", icon: "🌊" },
            ].map(a => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span>{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Setup reminder */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 space-y-1">
          <p className="font-medium">Setup checklist</p>
          <ul className="list-disc list-inside text-xs space-y-1 text-yellow-700">
            <li>Run <code className="bg-yellow-100 px-1 rounded">supabase/schema-art.sql</code> in your Supabase SQL editor</li>
            <li>Create the <code className="bg-yellow-100 px-1 rounded">art-images</code> storage bucket (public) in Supabase Storage</li>
            <li>Set <code className="bg-yellow-100 px-1 rounded">ADMIN_EMAIL</code> and <code className="bg-yellow-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> in <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
            <li>Create your admin user in Supabase Auth → Users → Add User</li>
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
