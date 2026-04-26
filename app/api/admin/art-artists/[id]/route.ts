import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, adminDb } from "@/lib/supabase/art-admin";
import { generateSlug } from "@/lib/art-utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  const db = adminDb();
  const { data: artist, error } = await db.from("art_artists").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Include current wave_ids
  const { data: junctionData } = await db
    .from("art_artist_waves")
    .select("wave_id")
    .eq("artist_id", id);
  const wave_ids = (junctionData ?? []).map((j: { wave_id: string }) => j.wave_id);

  return NextResponse.json({ ...artist, wave_ids });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { wave_ids, ...artistData } = body;
  const db = adminDb();

  const slug = artistData.slug?.trim() || generateSlug(artistData.name);
  const { data: existing } = await db
    .from("art_artists")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: `Slug "${slug}" already in use` }, { status: 409 });

  const { data: artist, error } = await db
    .from("art_artists")
    .update({ ...artistData, slug })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync wave associations: delete all, re-insert
  await db.from("art_artist_waves").delete().eq("artist_id", id);
  if (wave_ids?.length) {
    await db.from("art_artist_waves").insert(
      wave_ids.map((wid: string) => ({ artist_id: id, wave_id: wid }))
    );
  }

  return NextResponse.json(artist);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  const db = adminDb();
  const { error } = await db.from("art_artists").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
