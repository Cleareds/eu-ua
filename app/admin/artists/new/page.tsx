"use client";

import AdminShell from "@/components/admin/AdminShell";
import ArtistForm from "@/components/admin/ArtistForm";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

export default function NewArtistPage() {
  const { adminFetch } = useAdminAuth();
  return (
    <AdminShell title="New Artist">
      <ArtistForm adminFetch={adminFetch} />
    </AdminShell>
  );
}
