import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, adminClient } from "@/lib/supabase/art-admin";
import { generateSlug } from "@/lib/art-utils";
import { revalidateArt } from "@/lib/revalidate-art";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const db = adminClient(auth.token);
  const { data, error } = await db
    .from("art_objects")
    .select("*, artist:art_artists(id,name), wave:art_waves!wave_id(id,name)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json();
  const { wave_ids, ...objectData } = body;
  const db = adminClient(auth.token);

  const slug = objectData.slug?.trim() || generateSlug(objectData.title);
  const { data: existing } = await db
    .from("art_objects")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: `Slug "${slug}" already exists` }, { status: 409 });

  // wave_id is the denormalized "primary" — first selected movement
  const primaryWaveId: string | null =
    Array.isArray(wave_ids) && wave_ids.length > 0 ? wave_ids[0] : (objectData.wave_id ?? null);

  const { data, error } = await db
    .from("art_objects")
    .insert({ ...objectData, slug, wave_id: primaryWaveId })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (Array.isArray(wave_ids) && wave_ids.length) {
    await db.from("art_object_waves").insert(
      wave_ids.map((wid: string) => ({ object_id: data.id, wave_id: wid }))
    );
  }

  revalidateArt();
  return NextResponse.json(data, { status: 201 });
}
