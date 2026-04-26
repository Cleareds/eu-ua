"use client";

import AdminShell from "@/components/admin/AdminShell";
import WaveForm from "@/components/admin/WaveForm";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

export default function NewWavePage() {
  const { adminFetch } = useAdminAuth();
  return (
    <AdminShell title="New Art Wave">
      <WaveForm adminFetch={adminFetch} />
    </AdminShell>
  );
}
