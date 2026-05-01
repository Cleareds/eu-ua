/**
 * Public read functions for the People (Notable Ukrainians) section.
 * Uses anon key — RLS enforces published=true.
 */
import { createReadClient } from "./server";
import type { Person, PersonRecord } from "@/lib/types";

function db() {
  return createReadClient();
}

function recordToPerson(r: PersonRecord): Person {
  return {
    id: r.slug,
    name: r.name,
    years: r.years ?? "",
    role: r.role ?? "",
    birthplace: r.birthplace ?? "",
    era: r.era ?? "",
    description: r.description,
    europeanConnections: r.european_connections ?? [],
    sources: r.sources ?? [],
    profileImageUrl: r.profile_image_url,
  };
}

export async function getAllPeople(): Promise<Person[]> {
  const client = db();
  if (!client) return [];
  const { data, error } = await client
    .from("people")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("getAllPeople:", error.message);
    return [];
  }
  return (data ?? []).map(r => recordToPerson(r as PersonRecord));
}
