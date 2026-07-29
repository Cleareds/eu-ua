import type { MetadataRoute } from "next";
import { createReadClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

const BASE_URL = SITE_URL;

// Re-render the sitemap hourly so new admin-created artists/works show up
// without waiting for a redeploy.
export const revalidate = 3600;

interface Row {
  slug: string;
  updated_at: string | null;
}

async function fetchSlugs(table: string): Promise<Row[]> {
  const client = createReadClient();
  if (!client) return [];
  const { data, error } = await client
    .from(table)
    .select("slug, updated_at")
    .eq("published", true);
  if (error || !data) return [];
  return data as Row[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                  lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/eu-accession`,      lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/cultural-map`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/timeline`,          lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/people`,            lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/heritage`,          lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/ukrainian-art`,     lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/ukrainian-art/artists`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/ukrainian-art/waves`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/data-dashboard`,    lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/news`,              lastModified: now, changeFrequency: "daily",  priority: 0.8 },
    { url: `${BASE_URL}/myths`,             lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/quiz`,              lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/privacy`,           lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];

  // Pull dynamic art content from Supabase
  const [artists, artObjects, waves] = await Promise.all([
    fetchSlugs("art_artists"),
    fetchSlugs("art_objects"),
    fetchSlugs("art_waves"),
  ]);

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...artists.map(r => ({
      url: `${BASE_URL}/ukrainian-art/artists/${r.slug}`,
      lastModified: r.updated_at ? new Date(r.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...artObjects.map(r => ({
      url: `${BASE_URL}/ukrainian-art/art/${r.slug}`,
      lastModified: r.updated_at ? new Date(r.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...waves.map(r => ({
      url: `${BASE_URL}/ukrainian-art/waves/${r.slug}`,
      lastModified: r.updated_at ? new Date(r.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  return [...staticEntries, ...dynamicEntries];
}
