"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import AdminShell from "@/components/admin/AdminShell";
import ArtistForm from "@/components/admin/ArtistForm";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import type { ArtArtist } from "@/lib/types-art";

export default function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { adminFetch, state } = useAdminAuth();
  const [artist, setArtist] = useState<(ArtArtist & { wave_ids?: string[] }) | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (state !== "authenticated") return;
    adminFetch(`/api/admin/art-artists/${id}`).then(async res => {
      if (!res.ok) { setNotFound(true); return; }
      setArtist(await res.json());
    });
  }, [id, state, adminFetch]);

  if (notFound) {
    return <AdminShell title="Edit Artist"><p className="text-sm text-gray-500">Artist not found.</p></AdminShell>;
  }

  return (
    <AdminShell title={artist ? `Edit: ${artist.name}` : "Edit Artist"}>
      {artist ? <ArtistForm initial={artist} adminFetch={adminFetch} /> : <p className="text-sm text-gray-400">Loading…</p>}
    </AdminShell>
  );
}
