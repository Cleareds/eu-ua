import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, adminClient } from "@/lib/supabase/art-admin";
import { generateSlug } from "@/lib/art-utils";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const db = adminClient(auth.token);
  const { data, error } = await db
    .from("art_artists")
    .select("*")
    .order("born", { ascending: true, nullsFirst: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json();
  const { wave_ids, ...artistData } = body;
  const db = adminClient(auth.token);

  const slug = artistData.slug?.trim() || generateSlug(artistData.name);
  const { data: existing } = await db
    .from("art_artists")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: `Slug "${slug}" already exists` }, { status: 409 });

  const { data: artist, error } = await db
    .from("art_artists")
    .insert({ ...artistData, slug })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (wave_ids?.length) {
    await db.from("art_artist_waves").insert(
      wave_ids.map((wid: string) => ({ artist_id: artist.id, wave_id: wid }))
    );
  }

  return NextResponse.json(artist, { status: 201 });
}
