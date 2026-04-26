import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, adminDb } from "@/lib/supabase/art-admin";
import { generateSlug } from "@/lib/art-utils";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const db = adminDb();
  const { data, error } = await db
    .from("art_waves")
    .select("*")
    .order("start_year", { ascending: true, nullsFirst: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json();
  const db = adminDb();

  // Auto-generate slug if not provided
  const slug = body.slug?.trim() || generateSlug(body.name);

  // Check uniqueness
  const { data: existing } = await db
    .from("art_waves")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: `Slug "${slug}" already exists` }, { status: 409 });

  const { data, error } = await db
    .from("art_waves")
    .insert({ ...body, slug })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
