/**
 * Server-only admin utilities for Ukrainian Art.
 * Write operations use the user's JWT so Supabase RLS admin policies fire.
 * The service-role client is kept for verifyAdminRequest only (getUser call).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Creates a Supabase client authenticated with the user's JWT.
 * RLS sees auth.jwt() → app_metadata → role = "admin" on every request.
 */
export function adminClient(token: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
}

/** Extract and verify the admin JWT from the Authorization header. */
export async function verifyAdminRequest(
  req: NextRequest
): Promise<{ ok: true; adminEmail: string; token: string } | { ok: false; error: string }> {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { ok: false, error: "Missing Authorization header" };

  const svc = serviceClient();
  const { data: { user }, error } = await svc.auth.getUser(token);
  if (error || !user) return { ok: false, error: "Invalid or expired token" };

  if (user.app_metadata?.role !== "admin") {
    return { ok: false, error: "Forbidden" };
  }

  return { ok: true, adminEmail: user.email!, token };
}

/** @deprecated Use adminClient(token) from verifyAdminRequest instead. */
export function adminDb(): SupabaseClient {
  return serviceClient();
}

/**
 * Upload an image buffer to Supabase Storage using the admin's JWT so that
 * the storage RLS "Admin upload art-images" policy is satisfied.
 */
export async function uploadArtImage(
  buffer: Buffer,
  path: string,
  contentType: string,
  token?: string
): Promise<string> {
  const client = token ? adminClient(token) : serviceClient();
  const { error } = await client.storage
    .from("art-images")
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = client.storage.from("art-images").getPublicUrl(path);
  return data.publicUrl;
}
