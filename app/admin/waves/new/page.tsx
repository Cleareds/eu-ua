"use client";

import AdminShell from "@/components/admin/AdminShell";
import WaveForm from "@/components/admin/WaveForm";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

export default function NewWavePage() {
  const { adminFetch } = useAdminAuth();
  return (
    <AdminShell title="New Movement">
      <WaveForm adminFetch={adminFetch} />
    </AdminShell>
  );
}
