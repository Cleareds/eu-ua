#!/usr/bin/env npx tsx
/**
 * Seed the `people` table from data/people.json.
 * Idempotent: upserts by slug. Existing rows keep their published/featured/order/profile_image_url
 * unless those columns are still null.
 *
 * Run: npx tsx scripts/seed-people.ts
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

interface JsonPerson {
  id: string;
  name: string;
  years: string;
  role: string;
  birthplace: string;
  era: string;
  description: string;
  europeanConnections: string[];
  sources: { title: string; url: string }[];
}

const dataPath = path.join(process.cwd(), "data", "people.json");
const people = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as JsonPerson[];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function main() {
  console.log(`Seeding ${people.length} people…`);

  for (let i = 0; i < people.length; i++) {
    const p = people[i];
    const row = {
      slug: p.id,
      name: p.name,
      years: p.years,
      role: p.role,
      birthplace: p.birthplace,
      era: p.era,
      description: p.description,
      european_connections: p.europeanConnections ?? [],
      sources: p.sources ?? [],
      display_order: i + 1,
      featured: false,
      published: true,
    };

    // Insert-if-missing: preserves any edits already made through the admin panel
    const { error } = await supabase
      .from("people")
      .upsert(row, { onConflict: "slug", ignoreDuplicates: true });

    if (error) {
      console.error(`  ✗ ${p.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${p.name}`);
    }
  }

  console.log("Done.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
