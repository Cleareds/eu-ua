"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import AdminShell from "@/components/admin/AdminShell";
import ArtObjectForm from "@/components/admin/ArtObjectForm";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import type { ArtObject } from "@/lib/types-art";

export default function EditArtObjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { adminFetch, state } = useAdminAuth();
  const [obj, setObj] = useState<ArtObject | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (state !== "authenticated") return;
    adminFetch(`/api/admin/art-objects/${id}`).then(async res => {
      if (!res.ok) { setNotFound(true); return; }
      setObj(await res.json());
    });
  }, [id, state, adminFetch]);

  if (notFound) {
    return <AdminShell title="Edit Art Object"><p className="text-sm text-gray-500">Art object not found.</p></AdminShell>;
  }

  return (
    <AdminShell title={obj ? `Edit: ${obj.title}` : "Edit Art Object"}>
      {obj ? <ArtObjectForm initial={obj} adminFetch={adminFetch} /> : <p className="text-sm text-gray-400">Loading…</p>}
    </AdminShell>
  );
}
