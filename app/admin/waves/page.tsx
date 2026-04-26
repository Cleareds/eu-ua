"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { Toast } from "@/components/admin/FormField";
import type { ArtWave } from "@/lib/types-art";

export default function WavesAdminPage() {
  const { adminFetch, state } = useAdminAuth();
  const [waves, setWaves] = useState<ArtWave[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function load() {
    setLoading(true);
    const res = await adminFetch("/api/admin/art-waves");
    const data = await res.json();
    setWaves(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { if (state === "authenticated") load(); }, [state]); // eslint-disable-line

  async function handleDelete(wave: ArtWave) {
    if (!confirm(`Delete wave "${wave.name}"? This cannot be undone.`)) return;
    const res = await adminFetch(`/api/admin/art-waves/${wave.id}`, { method: "DELETE" });
    if (res.ok) { showToast("Wave deleted", "success"); load(); }
    else showToast("Delete failed", "error");
  }

  return (
    <AdminShell title="Art Waves">
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{waves.length} movement{waves.length !== 1 ? "s" : ""}</p>
          <Link
            href="/admin/waves/new"
            className="text-sm px-4 py-2 rounded text-white"
            style={{ backgroundColor: "#003399" }}
          >
            + New Wave
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : waves.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">🌊</div>
            <p className="text-sm">No art waves yet. Add the first one.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Period</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {waves.map(wave => (
                  <tr key={wave.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{wave.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{wave.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{wave.period ?? `${wave.start_year ?? "?"}–${wave.end_year ?? "present"}`}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${wave.published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {wave.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <Link href={`/admin/waves/${wave.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
                      <button onClick={() => handleDelete(wave)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
