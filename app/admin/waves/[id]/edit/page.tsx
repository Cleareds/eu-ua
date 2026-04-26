"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import AdminShell from "@/components/admin/AdminShell";
import WaveForm from "@/components/admin/WaveForm";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import type { ArtWave } from "@/lib/types-art";

export default function EditWavePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { adminFetch, state } = useAdminAuth();
  const [wave, setWave] = useState<ArtWave | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (state !== "authenticated") return;
    adminFetch(`/api/admin/art-waves/${id}`).then(async res => {
      if (!res.ok) { setNotFound(true); return; }
      setWave(await res.json());
    });
  }, [id, state, adminFetch]);

  if (notFound) {
    return <AdminShell title="Edit Wave"><p className="text-sm text-gray-500">Wave not found.</p></AdminShell>;
  }

  return (
    <AdminShell title={wave ? `Edit: ${wave.name}` : "Edit Wave"}>
      {wave ? <WaveForm initial={wave} adminFetch={adminFetch} /> : <p className="text-sm text-gray-400">Loading…</p>}
    </AdminShell>
  );
}
