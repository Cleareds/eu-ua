"use client";

import AdminShell from "@/components/admin/AdminShell";
import ArtObjectForm from "@/components/admin/ArtObjectForm";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

export default function NewArtObjectPage() {
  const { adminFetch } = useAdminAuth();
  return (
    <AdminShell title="New Art Object">
      <ArtObjectForm adminFetch={adminFetch} />
    </AdminShell>
  );
}
