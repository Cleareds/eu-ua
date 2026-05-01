"use client";

import { useState, useEffect, use } from "react";
import AdminShell from "@/components/admin/AdminShell";
import PersonForm from "@/components/admin/PersonForm";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import type { PersonRecord } from "@/lib/types";

export default function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { adminFetch, state } = useAdminAuth();
  const [person, setPerson] = useState<PersonRecord | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (state !== "authenticated") return;
    adminFetch(`/api/admin/people/${id}`).then(async res => {
      if (!res.ok) { setNotFound(true); return; }
      setPerson(await res.json());
    });
  }, [id, state, adminFetch]);

  if (notFound) {
    return <AdminShell title="Edit Person"><p className="text-sm text-gray-500">Person not found.</p></AdminShell>;
  }

  return (
    <AdminShell title={person ? `Edit: ${person.name}` : "Edit Person"}>
      {person ? <PersonForm initial={person} adminFetch={adminFetch} /> : <p className="text-sm text-gray-400">Loading…</p>}
    </AdminShell>
  );
}
