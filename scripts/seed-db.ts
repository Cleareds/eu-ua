#!/usr/bin/env npx tsx
/**
 * Seed Supabase database from local JSON files.
 * Run once after setting up your Supabase project:
 *   npx tsx scripts/seed-db.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * Uses anon key — schema must have public insert policies (see supabase/schema.sql)
 */

import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role if available, otherwise fall back to anon (requires open insert policies)
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, key);

function readJSON(file: string) {
  return JSON.parse(readFileSync(resolve(process.cwd(), "data", file), "utf-8"));
}

async function seedChapters() {
  console.log("Seeding eu_chapters...");
  const chapters = readJSON("euChapters.json");
  const { error } = await db.from("eu_chapters").upsert(chapters, { onConflict: "id" });
  if (error) throw error;
  console.log(`  ✓ ${chapters.length} chapters`);
}

async function seedCities() {
  console.log("Seeding cities...");
  const cities = readJSON("cities.json");
  const rows = cities.map((c: any) => ({
    id: c.id,
    name: c.name,
    lat: c.lat,
    lng: c.lng,
    description: c.description,
    connections: c.connections,
    notable_figures: c.notableFigures,
    european_influences: c.europeanInfluences,
  }));
  const { error } = await db.from("cities").upsert(rows, { onConflict: "id" });
  if (error) throw error;
  console.log(`  ✓ ${rows.length} cities`);
}

async function seedDataPoints() {
  console.log("Seeding data_points...");
  const data = readJSON("euUkraineData.json");
  const rows: { category: string; year: number; value: number }[] = [];
  for (const [category, points] of Object.entries(data)) {
    for (const p of points as { year: number; value: number }[]) {
      rows.push({ category, year: p.year, value: p.value });
    }
  }
  const { error } = await db.from("data_points").upsert(rows, { onConflict: "category,year" });
  if (error) throw error;
  console.log(`  ✓ ${rows.length} data points`);
}

async function seedMyths() {
  console.log("Seeding myths...");
  const myths = readJSON("myths.json");
  const mythRows = myths.map((m: any) => ({ id: m.id, myth: m.myth, reality: m.reality }));
  const { error: e1 } = await db.from("myths").upsert(mythRows, { onConflict: "id" });
  if (e1) throw e1;

  // Delete and re-insert sources to avoid dupes
  await db.from("myth_sources").delete().gte("id", 0);
  const sourceRows = myths.flatMap((m: any) =>
    m.sources.map((s: any) => ({ myth_id: m.id, title: s.title, url: s.url }))
  );
  const { error: e2 } = await db.from("myth_sources").insert(sourceRows);
  if (e2) throw e2;
  console.log(`  ✓ ${myths.length} myths, ${sourceRows.length} sources`);
}

async function seedQuiz() {
  console.log("Seeding quiz_questions...");
  const questions = readJSON("quiz.json");
  const { error } = await db.from("quiz_questions").upsert(questions, { onConflict: "id" });
  if (error) throw error;
  console.log(`  ✓ ${questions.length} questions`);
}

async function seedNews() {
  console.log("Seeding news_timeline...");
  const news = readJSON("news-timeline.json");
  const rows = news.map((n: any) => ({
    date: n.date,
    headline: n.headline,
    summary: n.summary,
    source: n.source,
    url: n.url,
  }));
  // upsert by URL to avoid duplicates
  const { error } = await db.from("news_timeline").upsert(rows, { onConflict: "url" });
  if (error) throw error;
  console.log(`  ✓ ${rows.length} news items`);
}

async function main() {
  console.log("🌱 Seeding EU-UA.com database...\n");
  await seedChapters();
  await seedCities();
  await seedDataPoints();
  await seedMyths();
  await seedQuiz();
  await seedNews();
  console.log("\n✅ Database seeded successfully!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
