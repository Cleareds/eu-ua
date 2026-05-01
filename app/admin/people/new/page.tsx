"use client";

import AdminShell from "@/components/admin/AdminShell";
import PersonForm from "@/components/admin/PersonForm";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

export default function NewPersonPage() {
  const { adminFetch } = useAdminAuth();
  return (
    <AdminShell title="New Person">
      <PersonForm adminFetch={adminFetch} />
    </AdminShell>
  );
}
