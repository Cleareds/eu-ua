import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, adminClient } from "@/lib/supabase/art-admin";
import { generateSlug } from "@/lib/art-utils";
import { revalidateArt } from "@/lib/revalidate-art";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  const db = adminClient(auth.token);
  const { data, error } = await db.from("art_objects").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: junctionData } = await db
    .from("art_object_waves")
    .select("wave_id")
    .eq("object_id", id);
  const wave_ids = (junctionData ?? []).map((j: { wave_id: string }) => j.wave_id);
  // Ensure primary wave_id is first in the list (preserves UX ordering)
  if (data.wave_id && wave_ids.includes(data.wave_id)) {
    const others = wave_ids.filter(w => w !== data.wave_id);
    wave_ids.length = 0;
    wave_ids.push(data.wave_id, ...others);
  }

  return NextResponse.json({ ...data, wave_ids });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { wave_ids, ...objectData } = body;
  const db = adminClient(auth.token);

  const slug = objectData.slug?.trim() || generateSlug(objectData.title);
  const { data: existing } = await db
    .from("art_objects")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: `Slug "${slug}" already in use` }, { status: 409 });

  const primaryWaveId: string | null =
    Array.isArray(wave_ids) && wave_ids.length > 0 ? wave_ids[0] : (objectData.wave_id ?? null);

  const { data, error } = await db
    .from("art_objects")
    .update({ ...objectData, slug, wave_id: primaryWaveId })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("art_object_waves").delete().eq("object_id", id);
  if (Array.isArray(wave_ids) && wave_ids.length) {
    await db.from("art_object_waves").insert(
      wave_ids.map((wid: string) => ({ object_id: id, wave_id: wid }))
    );
  }

  revalidateArt();
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  const db = adminClient(auth.token);
  const { error } = await db.from("art_objects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateArt();
  return NextResponse.json({ ok: true });
}
