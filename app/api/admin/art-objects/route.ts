import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, adminDb } from "@/lib/supabase/art-admin";
import { generateSlug } from "@/lib/art-utils";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const db = adminDb();
  const { data, error } = await db
    .from("art_objects")
    .select("*, artist:art_artists(id,name), wave:art_waves(id,name)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json();
  const db = adminDb();

  const slug = body.slug?.trim() || generateSlug(body.title);
  const { data: existing } = await db
    .from("art_objects")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: `Slug "${slug}" already exists` }, { status: 409 });

  const { data, error } = await db
    .from("art_objects")
    .insert({ ...body, slug })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
