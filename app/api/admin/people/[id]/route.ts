import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, adminClient } from "@/lib/supabase/art-admin";
import { generateSlug } from "@/lib/art-utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  const db = adminClient(auth.token);
  const { data, error } = await db.from("people").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const db = adminClient(auth.token);

  const slug = body.slug?.trim() || generateSlug(body.name);
  const { data: existing } = await db
    .from("people")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: `Slug "${slug}" already in use` }, { status: 409 });

  const { data, error } = await db
    .from("people")
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
  const db = adminClient(auth.token);
  const { error } = await db.from("people").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
