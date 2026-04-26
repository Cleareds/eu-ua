import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, adminDb } from "@/lib/supabase/art-admin";
import { generateSlug } from "@/lib/art-utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  const db = adminDb();
  const { data, error } = await db.from("art_objects").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const db = adminDb();

  const slug = body.slug?.trim() || generateSlug(body.title);
  const { data: existing } = await db
    .from("art_objects")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: `Slug "${slug}" already in use` }, { status: 409 });

  const { data, error } = await db
    .from("art_objects")
    .update({ ...body, slug })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  const db = adminDb();
  const { error } = await db.from("art_objects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
