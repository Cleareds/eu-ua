"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { Toast } from "@/components/admin/FormField";
import type { ArtObject } from "@/lib/types-art";

export default function ArtObjectsAdminPage() {
  const { adminFetch, state } = useAdminAuth();
  const router = useRouter();
  const [objects, setObjects] = useState<ArtObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function load() {
    setLoading(true);
    const res = await adminFetch("/api/admin/art-objects");
    const data = await res.json();
    setObjects(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { if (state === "authenticated") load(); }, [state]); // eslint-disable-line

  async function handleDelete(e: React.MouseEvent, obj: ArtObject) {
    e.stopPropagation();
    if (!confirm(`Delete "${obj.title}"? This cannot be undone.`)) return;
    const res = await adminFetch(`/api/admin/art-objects/${obj.id}`, { method: "DELETE" });
    if (res.ok) { showToast("Art object deleted", "success"); load(); }
    else showToast("Delete failed", "error");
  }

  return (
    <AdminShell title="Art Objects">
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{objects.length} artwork{objects.length !== 1 ? "s" : ""}</p>
          <Link href="/admin/art/new" className="text-sm px-4 py-2 rounded text-white" style={{ backgroundColor: "#003399" }}>
            + New Art Object
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : objects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">🖼</div>
            <p className="text-sm">No art objects yet. Add the first artwork.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs w-12"></th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Title</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Artist</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Year</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {objects.map(obj => (
                  <tr
                    key={obj.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/art/${obj.id}/edit`)}
                  >
                    <td className="px-4 py-2">
                      {obj.image_url ? (
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100">
                          <Image src={obj.image_url} alt={obj.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-lg">🖼</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate max-w-[200px]">{obj.title}</div>
                      <div className="text-xs text-gray-400 font-mono">{obj.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {(obj.artist as { name: string } | null)?.name ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{obj.year ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${obj.published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {obj.published ? "Published" : "Draft"}
                        </span>
                        {obj.featured && <span className="text-xs">⭐</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3" onClick={e => e.stopPropagation()}>
                      <Link href={`/admin/art/${obj.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
                      <button onClick={e => handleDelete(e, obj)} className="text-xs text-red-500 hover:underline">Delete</button>
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
