/**
 * Public read functions for Ukrainian Art content.
 * Uses anon key — only returns published records (enforced by RLS).
 */
import { createReadClient } from "./server";
import type { ArtWave, ArtArtist, ArtObject } from "@/lib/types-art";

function db() {
  return createReadClient();
}

/**
 * Column lists for grid/card views, i.e. everything except the long markdown
 * body. Cards never render it, but `select("*")` still ships it to the browser
 * inside the RSC payload — on /ukrainian-art/art that was ~700 KB of the
 * 780 KB response. Detail pages still select "*".
 */
const OBJECT_CARD_COLUMNS =
  "id,slug,title,title_uk,artist_id,wave_id,year,medium,dimensions,location,short_description,image_url,tags,featured,published,created_at,updated_at";
const ARTIST_CARD_COLUMNS =
  "id,slug,name,name_uk,born,died,birth_place,short_bio,profile_image_url,website_url,tags,featured,published,created_at,updated_at";
const WAVE_CARD_COLUMNS =
  "id,slug,name,name_uk,period,start_year,end_year,description,cover_image_url,tags,published,created_at,updated_at";

// ─── Art Waves ───────────────────────────────────────────────────────────────

export async function getArtWaves(): Promise<ArtWave[]> {
  const client = db();
  if (!client) return [];
  const { data, error } = await client
    .from("art_waves")
    .select(WAVE_CARD_COLUMNS)
    .eq("published", true)
    .order("start_year", { ascending: true, nullsFirst: false });
  if (error) { console.error("getArtWaves:", error.message); return []; }
  return (data ?? []) as ArtWave[];
}

export async function getArtWaveBySlug(slug: string): Promise<ArtWave | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("art_waves")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error) return null;
  return data as ArtWave;
}

// ─── Artists ─────────────────────────────────────────────────────────────────

export async function getArtArtists(): Promise<ArtArtist[]> {
  const client = db();
  if (!client) return [];
  const { data, error } = await client
    .from("art_artists")
    .select(ARTIST_CARD_COLUMNS)
    .eq("published", true)
    .order("born", { ascending: true, nullsFirst: false });
  if (error) { console.error("getArtArtists:", error.message); return []; }
  return (data ?? []) as ArtArtist[];
}

export async function getFeaturedArtists(limit = 6): Promise<ArtArtist[]> {
  const client = db();
  if (!client) return [];
  const { data, error } = await client
    .from("art_artists")
    .select(ARTIST_CARD_COLUMNS)
    .eq("published", true)
    .eq("featured", true)
    .order("born", { ascending: true })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as ArtArtist[];
}

export async function getArtArtistBySlug(slug: string): Promise<ArtArtist | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("art_artists")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error) return null;

  // Fetch associated waves via junction
  const { data: junctionData } = await client
    .from("art_artist_waves")
    .select("wave_id")
    .eq("artist_id", data.id);

  let waves: ArtWave[] = [];
  if (junctionData?.length) {
    const waveIds = junctionData.map((j: { wave_id: string }) => j.wave_id);
    const { data: wavesData } = await client
      .from("art_waves")
      .select("*")
      .in("id", waveIds)
      .eq("published", true);
    waves = (wavesData ?? []) as ArtWave[];
  }

  return { ...data, waves } as ArtArtist;
}

export async function getArtistsByWave(waveId: string): Promise<ArtArtist[]> {
  const client = db();
  if (!client) return [];
  const { data: junctionData } = await client
    .from("art_artist_waves")
    .select("artist_id")
    .eq("wave_id", waveId);

  if (!junctionData?.length) return [];
  const ids = junctionData.map((j: { artist_id: string }) => j.artist_id);
  const { data, error } = await client
    .from("art_artists")
    .select(ARTIST_CARD_COLUMNS)
    .in("id", ids)
    .eq("published", true)
    .order("born", { ascending: true });
  if (error) return [];
  return (data ?? []) as ArtArtist[];
}

// ─── Art Objects ─────────────────────────────────────────────────────────────

export async function getArtObjects(limit?: number): Promise<ArtObject[]> {
  const client = db();
  if (!client) return [];
  let query = client
    .from("art_objects")
    .select(`${OBJECT_CARD_COLUMNS}, artist:art_artists(id,slug,name,profile_image_url), wave:art_waves!wave_id(id,slug,name)`)
    .eq("published", true)
    .order("year", { ascending: true, nullsFirst: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error("getArtObjects:", error.message); return []; }
  return (data ?? []) as unknown as ArtObject[];
}

export async function getRecentArtObjects(limit = 6): Promise<ArtObject[]> {
  const client = db();
  if (!client) return [];
  const { data, error } = await client
    .from("art_objects")
    .select(`${OBJECT_CARD_COLUMNS}, artist:art_artists(id,slug,name,profile_image_url), wave:art_waves!wave_id(id,slug,name)`)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("getRecentArtObjects:", error.message); return []; }
  return (data ?? []) as unknown as ArtObject[];
}

export async function getFeaturedArtObjects(limit = 9): Promise<ArtObject[]> {
  const client = db();
  if (!client) return [];
  const { data, error } = await client
    .from("art_objects")
    .select(`${OBJECT_CARD_COLUMNS}, artist:art_artists(id,slug,name,profile_image_url), wave:art_waves!wave_id(id,slug,name)`)
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as unknown as ArtObject[];
}

export async function getArtObjectBySlug(slug: string): Promise<ArtObject | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("art_objects")
    .select("*, artist:art_artists(*), wave:art_waves!wave_id(*)")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error) return null;

  // Fetch the full list of associated movements via the junction
  const { data: junctionData } = await client
    .from("art_object_waves")
    .select("wave_id")
    .eq("object_id", data.id);

  let waves: ArtWave[] = [];
  if (junctionData?.length) {
    const waveIds = junctionData.map((j: { wave_id: string }) => j.wave_id);
    const { data: wavesData } = await client
      .from("art_waves")
      .select("*")
      .in("id", waveIds)
      .eq("published", true);
    const list = (wavesData ?? []) as ArtWave[];
    // Put primary wave (data.wave_id) first
    waves = data.wave_id
      ? [...list.filter(w => w.id === data.wave_id), ...list.filter(w => w.id !== data.wave_id)]
      : list;
  } else if (data.wave) {
    waves = [data.wave as ArtWave];
  }

  return { ...data, waves } as unknown as ArtObject;
}

export async function getArtObjectsByArtist(artistId: string, excludeSlug?: string): Promise<ArtObject[]> {
  const client = db();
  if (!client) return [];
  let query = client
    .from("art_objects")
    .select(`${OBJECT_CARD_COLUMNS}, wave:art_waves!wave_id(id,slug,name)`)
    .eq("published", true)
    .eq("artist_id", artistId)
    .order("year", { ascending: true, nullsFirst: false })
    .limit(12);
  if (excludeSlug) query = query.neq("slug", excludeSlug);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as unknown as ArtObject[];
}

export async function getArtObjectsByWave(waveId: string, excludeSlug?: string): Promise<ArtObject[]> {
  const client = db();
  if (!client) return [];

  // Pull from the M2M junction so works in multiple movements show up on each
  const { data: junctionData } = await client
    .from("art_object_waves")
    .select("object_id")
    .eq("wave_id", waveId);

  if (!junctionData?.length) return [];
  const ids = junctionData.map((j: { object_id: string }) => j.object_id);

  let query = client
    .from("art_objects")
    .select(`${OBJECT_CARD_COLUMNS}, artist:art_artists(id,slug,name)`)
    .eq("published", true)
    .in("id", ids)
    .order("year", { ascending: true, nullsFirst: false })
    .limit(12);
  if (excludeSlug) query = query.neq("slug", excludeSlug);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as unknown as ArtObject[];
}

export async function getAllArtObjectSlugs(): Promise<string[]> {
  const client = db();
  if (!client) return [];
  const { data } = await client
    .from("art_objects")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((r: { slug: string }) => r.slug);
}

export async function getAllArtistSlugs(): Promise<string[]> {
  const client = db();
  if (!client) return [];
  const { data } = await client
    .from("art_artists")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((r: { slug: string }) => r.slug);
}

export async function getAllArtWaveSlugs(): Promise<string[]> {
  const client = db();
  if (!client) return [];
  const { data } = await client
    .from("art_waves")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((r: { slug: string }) => r.slug);
}

/** Row counts for headline copy — avoids fetching every row just to call .length */
export async function getArtCounts(): Promise<{ objects: number; artists: number }> {
  const client = db();
  if (!client) return { objects: 0, artists: 0 };
  const [objects, artists] = await Promise.all([
    client.from("art_objects").select("id", { count: "exact", head: true }).eq("published", true),
    client.from("art_artists").select("id", { count: "exact", head: true }).eq("published", true),
  ]);
  return { objects: objects.count ?? 0, artists: artists.count ?? 0 };
}
