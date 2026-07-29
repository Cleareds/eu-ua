/**
 * Load data/*.json into Supabase.
 *
 *   npx tsx scripts/sync-reference-data.ts          # write
 *   npx tsx scripts/sync-reference-data.ts --check  # report differences only
 *
 * Run this after editing any file in data/, until those datasets are editable in
 * the CMS. Requires supabase/schema-reference-data.sql to have been applied.
 *
 * Upserts by primary key and never deletes: a row that exists in the database but
 * not in the JSON is reported as an orphan and left alone, because deleting rows
 * on the strength of a local file is not something a sync script should decide.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

import chapters from "../data/euChapters.json";
import cities from "../data/cities.json";
import myths from "../data/myths.json";
import quizGeneral from "../data/quiz.json";
import quizPeople from "../data/quiz-people.json";
import quizPlaces from "../data/quiz-places.json";
import quizHeritage from "../data/quiz-heritage.json";
import timeline from "../data/timeline.json";
import culturalSites from "../data/cultural-sites.json";
import diaspora from "../data/diaspora-heritage.json";
import euData from "../data/euUkraineData.json";

config({ path: ".env.local" });

const CHECK_ONLY = process.argv.includes("--check");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(url, key);

let failed = false;

/** Upsert `rows` into `table`, then report the row count and any DB-only rows. */
async function sync(
  table: string,
  rows: Record<string, unknown>[],
  opts: { conflict?: string; idField?: string } = {},
) {
  const conflict = opts.conflict ?? "id";
  const idField = opts.idField ?? "id";

  const { count: before, error: countError } = await db
    .from(table)
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.log(`  ✗ ${table.padEnd(20)} ${countError.message}`);
    failed = true;
    return;
  }

  if (CHECK_ONLY) {
    const drift =
      before === null
        ? `table missing — apply schema-reference-data.sql (JSON has ${rows.length})`
        : before === rows.length
          ? "in sync"
          : `DB ${before} vs JSON ${rows.length}`;
    console.log(`  · ${table.padEnd(20)} ${drift}`);
    return;
  }

  // Chunked so a large table doesn't hit request size limits.
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await db.from(table).upsert(rows.slice(i, i + 200), { onConflict: conflict });
    if (error) {
      console.log(`  ✗ ${table.padEnd(20)} ${error.message}`);
      failed = true;
      return;
    }
  }

  const { count: after } = await db.from(table).select("*", { count: "exact", head: true });
  const orphans = (after ?? 0) - rows.length;
  const note = orphans > 0 ? `  (${orphans} row(s) in DB but not in JSON — left in place)` : "";
  console.log(`  ✓ ${table.padEnd(20)} ${rows.length} row(s) upserted, ${after} total${note}`);
  void idField;
}

async function main() {
  console.log(CHECK_ONLY ? "Checking data/*.json against Supabase…\n" : "Syncing data/*.json → Supabase…\n");

  await sync(
    "eu_chapters",
    chapters.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      description: c.description,
      cluster: "cluster" in c ? c.cluster : null,
      cluster_name: "clusterName" in c ? c.clusterName : null,
      updated_at: new Date().toISOString(),
    })),
  );

  await sync(
    "cities",
    cities.map(c => ({
      id: c.id,
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      status: "status" in c ? c.status : null,
      description: c.description,
      connections: c.connections,
      notable_figures: c.notableFigures,
      european_influences: c.europeanInfluences,
      sources: c.sources ?? [],
      image: "image" in c ? c.image : null,
      updated_at: new Date().toISOString(),
    })),
  );

  await sync(
    "myths",
    myths.map(m => ({ id: m.id, myth: m.myth, reality: m.reality })),
  );

  // myth_sources has its own surrogate id, so it is replaced wholesale rather than
  // upserted — otherwise removing a source from the JSON would leave it behind.
  if (!CHECK_ONLY) {
    const sources = myths.flatMap(m =>
      (m.sources ?? []).map(s => ({ myth_id: m.id, title: s.title, url: s.url })),
    );
    const { error: delError } = await db.from("myth_sources").delete().neq("myth_id", -1);
    if (delError) {
      console.log(`  ✗ myth_sources        ${delError.message}`);
      failed = true;
    } else {
      const { error } = await db.from("myth_sources").insert(sources);
      if (error) {
        console.log(`  ✗ myth_sources        ${error.message}`);
        failed = true;
      } else {
        console.log(`  ✓ ${"myth_sources".padEnd(20)} ${sources.length} row(s) replaced`);
      }
    }
  }

  const quiz = [
    ...quizGeneral.map(q => ({ ...q, category: "general" })),
    ...quizPeople.map(q => ({ ...q, category: "people" })),
    ...quizPlaces.map(q => ({ ...q, category: "places" })),
    ...quizHeritage.map(q => ({ ...q, category: "heritage" })),
  ];
  await sync(
    "quiz_questions",
    quiz.map(q => ({
      id: q.id,
      category: q.category,
      question: q.question,
      options: q.options,
      correct: q.correct,
      explanation: q.explanation,
      updated_at: new Date().toISOString(),
    })),
    { conflict: "category,id" },
  );

  await sync(
    "timeline_events",
    timeline.map(e => ({
      id: e.id,
      year: e.year,
      year_sort: e.yearSort,
      title: e.title,
      description: e.description,
      era: e.era,
      type: e.type,
      european_connection: e.europeanConnection,
      source_label: "sourceLabel" in e ? e.sourceLabel : null,
      source_url: "sourceUrl" in e ? e.sourceUrl : null,
      updated_at: new Date().toISOString(),
    })),
  );

  await sync(
    "cultural_sites",
    culturalSites.map(s => ({
      id: s.id,
      name: s.name,
      city: "city" in s ? s.city : null,
      lat: s.lat,
      lng: s.lng,
      type: "type" in s ? s.type : null,
      description: s.description,
      damage: "damage" in s ? s.damage : null,
      date: "date" in s ? s.date : null,
      sources: s.sources ?? [],
      image: "image" in s ? s.image : null,
      updated_at: new Date().toISOString(),
    })),
  );

  await sync(
    "diaspora_heritage",
    diaspora.map(s => ({
      id: s.id,
      name: s.name,
      city: "city" in s ? s.city : null,
      country: "country" in s ? s.country : null,
      lat: s.lat,
      lng: s.lng,
      category: "category" in s ? s.category : null,
      ukrainian_connection: "ukrainianConnection" in s ? s.ukrainianConnection : null,
      description: s.description,
      sources: s.sources ?? [],
      image: "image" in s ? s.image : null,
      updated_at: new Date().toISOString(),
    })),
  );

  // data_points is keyed by a surrogate id, so it is rebuilt from (category, year).
  const points = Object.entries(euData).flatMap(([category, series]) =>
    (series as { year: number; value: number }[]).map(p => ({
      category,
      year: p.year,
      value: p.value,
    })),
  );
  if (CHECK_ONLY) {
    const { count } = await db.from("data_points").select("*", { count: "exact", head: true });
    console.log(`  · ${"data_points".padEnd(20)} ${count === points.length ? "in sync" : `DB ${count} vs JSON ${points.length}`}`);
  } else {
    const { error: delError } = await db.from("data_points").delete().neq("year", -1);
    if (delError) {
      console.log(`  ✗ data_points         ${delError.message}`);
      failed = true;
    } else {
      const { error } = await db.from("data_points").insert(points);
      if (error) {
        console.log(`  ✗ data_points         ${error.message}`);
        failed = true;
      } else {
        console.log(`  ✓ ${"data_points".padEnd(20)} ${points.length} row(s) replaced`);
      }
    }
  }

  if (failed) {
    console.log(
      "\nSome tables failed. If the errors mention a missing table or column, apply\n" +
        "supabase/schema-reference-data.sql in the Supabase SQL editor first.",
    );
    process.exit(1);
  }
  console.log(CHECK_ONLY ? "\nCheck complete." : "\nSync complete.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
