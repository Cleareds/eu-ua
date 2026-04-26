"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { Toast } from "@/components/admin/FormField";
import { artistLifespan } from "@/lib/art-utils";
import type { ArtArtist } from "@/lib/types-art";

export default function ArtistsAdminPage() {
  const { adminFetch, state } = useAdminAuth();
  const router = useRouter();
  const [artists, setArtists] = useState<ArtArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function load() {
    setLoading(true);
    const res = await adminFetch("/api/admin/art-artists");
    const data = await res.json();
    setArtists(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { if (state === "authenticated") load(); }, [state]); // eslint-disable-line

  async function handleDelete(e: React.MouseEvent, artist: ArtArtist) {
    e.stopPropagation();
    if (!confirm(`Delete artist "${artist.name}"? Art objects by this artist will lose their artist reference.`)) return;
    const res = await adminFetch(`/api/admin/art-artists/${artist.id}`, { method: "DELETE" });
    if (res.ok) { showToast("Artist deleted", "success"); load(); }
    else showToast("Delete failed", "error");
  }

  return (
    <AdminShell title="Artists">
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{artists.length} artist{artists.length !== 1 ? "s" : ""}</p>
          <Link href="/admin/artists/new" className="text-sm px-4 py-2 rounded text-white" style={{ backgroundColor: "#003399" }}>
            + New Artist
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : artists.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">👤</div>
            <p className="text-sm">No artists yet. Add the first one.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Artist</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Years</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Featured</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {artists.map(artist => (
                  <tr
                    key={artist.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/artists/${artist.id}/edit`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{artist.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{artist.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{artistLifespan(artist.born, artist.died)}</td>
                    <td className="px-4 py-3 text-xs">{artist.featured ? "⭐" : ""}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${artist.published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {artist.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3" onClick={e => e.stopPropagation()}>
                      <Link href={`/admin/artists/${artist.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
                      <button onClick={e => handleDelete(e, artist)} className="text-xs text-red-500 hover:underline">Delete</button>
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
