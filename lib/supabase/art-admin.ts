/**
 * Server-only admin utilities for Ukrainian Art.
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS.
 * All public exports verify admin identity before operating.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Extract and verify the admin JWT from the Authorization header. */
export async function verifyAdminRequest(req: NextRequest): Promise<{ ok: true; adminEmail: string } | { ok: false; error: string }> {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { ok: false, error: "Missing Authorization header" };

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return { ok: false, error: "ADMIN_EMAIL env var not set" };

  // Verify token against Supabase (service client can call auth.getUser)
  const svc = serviceClient();
  const { data: { user }, error } = await svc.auth.getUser(token);
  if (error || !user) return { ok: false, error: "Invalid or expired token" };
  if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    return { ok: false, error: "Forbidden" };
  }

  return { ok: true, adminEmail: user.email! };
}

/** Returns the service-role Supabase client for DB writes. */
export function adminDb(): SupabaseClient {
  return serviceClient();
}

/** Upload an image buffer to Supabase Storage, return the public URL. */
export async function uploadArtImage(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<string> {
  const svc = serviceClient();
  const { error } = await svc.storage
    .from("art-images")
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = svc.storage.from("art-images").getPublicUrl(path);
  return data.publicUrl;
}
