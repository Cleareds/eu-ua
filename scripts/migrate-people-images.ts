#!/usr/bin/env npx tsx
/**
 * Upload the bundled /public/people/<slug>.png files to Supabase Storage
 * and write the resulting public URL into people.profile_image_url.
 *
 * Idempotent: only updates rows where profile_image_url is currently null/empty.
 *
 * Run: npx tsx scripts/migrate-people-images.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const peopleDir = path.join(process.cwd(), "public", "people");
const BUCKET = "art-images";

async function main() {
  const { data: rows, error } = await supabase
    .from("people")
    .select("id, slug, name, profile_image_url");
  if (error) { console.error("DB read failed:", error.message); process.exit(1); }
  if (!rows) return;

  console.log(`Checking ${rows.length} people…`);

  for (const row of rows) {
    if (row.profile_image_url) {
      console.log(`  · ${row.name} — already has URL, skipping`);
      continue;
    }

    const filePath = path.join(peopleDir, `${row.slug}.png`);
    if (!fs.existsSync(filePath)) {
      console.log(`  · ${row.name} — no bundled image at ${row.slug}.png, skipping`);
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const storagePath = `people/${row.slug}.png`;

    const { error: upErr } = await supabase
      .storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: "image/png", upsert: true });
    if (upErr) {
      console.error(`  ✗ ${row.name} — upload failed: ${upErr.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    const { error: updErr } = await supabase
      .from("people")
      .update({ profile_image_url: publicUrl })
      .eq("id", row.id);
    if (updErr) {
      console.error(`  ✗ ${row.name} — DB update failed: ${updErr.message}`);
      continue;
    }

    console.log(`  ✓ ${row.name} → ${publicUrl}`);
  }

  console.log("Done.");
}

main().catch(err => { console.error(err); process.exit(1); });
