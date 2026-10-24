#!/usr/bin/env npx tsx
/**
 * Apply editor-approved fixes from a review file (default: reviews/source-fixes.json).
 * Only items with status "approved" are applied; they are then marked "applied".
 *
 * Item actions:
 *   replace  oldUrl → newUrl (+ newTitle)
 *   remove   oldUrl
 *   add      newUrl + newTitle
 *   text     field: replace the exact snippet `find` with `replaceWith`
 *   claim    fact-check finding — never applied here; an approved claim is rewritten
 *            by hand (as `text` items) and those are reviewed again
 *
 * Targets: data/*.json files, or Supabase `people` (sources, text fields) and
 * `art_artists` (website_url, text fields) — see each item's `where`.
 *
 * Dry run: npx tsx scripts/apply-source-fixes.ts [file]
 * Apply:   npx tsx scripts/apply-source-fixes.ts [file] --apply
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const APPLY = process.argv.includes("--apply");
const REVIEW_FILE = process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "reviews/source-fixes.json";

interface Fix {
  id: string;
  record: string;          // "site:odesa-historic-centre"
  where: string;           // "data/cultural-sites.json" | "supabase:people" | "supabase:art_artists"
  action: "replace" | "remove" | "add" | "text" | "claim";
  status: "pending" | "approved" | "rejected" | "applied";
  oldUrl?: string;
  newUrl?: string;
  newTitle?: string;
  field?: string;
  find?: string;
  replaceWith?: string;
}

interface Source { title: string; url: string }

/** Apply one fix to a record object in place. Returns a problem string, or null when it applied. */
function applyFix(rec: Record<string, any>, fix: Fix, sourceShape: "array" | "timeline" | "website"): string | null {
  if (fix.action === "text") {
    const value = rec[fix.field!];
    if (typeof value !== "string" || !value.includes(fix.find!)) return `text "${fix.find}" not found in ${fix.field}`;
    rec[fix.field!] = value.replace(fix.find!, fix.replaceWith!);
    return null;
  }

  if (sourceShape === "timeline") {
    // Timeline events hold a single source in sourceUrl/sourceLabel.
    if (fix.action === "remove") {
      if (rec.sourceUrl !== fix.oldUrl) return "oldUrl not found";
      rec.sourceUrl = "";
      rec.sourceLabel = "";
    } else if (fix.action === "replace") {
      if (rec.sourceUrl !== fix.oldUrl) return "oldUrl not found";
      rec.sourceUrl = fix.newUrl;
      rec.sourceLabel = fix.newTitle;
    } else if (!rec.sourceUrl) {
      rec.sourceUrl = fix.newUrl;
      rec.sourceLabel = fix.newTitle;
    } else return "timeline already has a source (only one allowed)";
    return null;
  }

  if (sourceShape === "website") {
    if (fix.action === "add") {
      if (rec.website_url) return "artist already has website_url";
      rec.website_url = fix.newUrl;
      return null;
    }
    if (rec.website_url !== fix.oldUrl) return "oldUrl not found";
    rec.website_url = fix.action === "replace" ? fix.newUrl : null;
    return null;
  }

  const sources: Source[] = rec.sources ?? [];
  const i = sources.findIndex((s) => s.url === fix.oldUrl);
  if (fix.action === "add") {
    if (sources.some((s) => s.url === fix.newUrl)) return "already present";
    rec.sources = [...sources, { title: fix.newTitle!, url: fix.newUrl! }];
  } else if (i === -1) return "oldUrl not found";
  else if (fix.action === "remove") rec.sources = sources.filter((_, j) => j !== i);
  else rec.sources = sources.map((s, j) => (j === i ? { title: fix.newTitle ?? s.title, url: fix.newUrl! } : s));
  return null;
}

// Removes run before adds, so a record never briefly holds two sources where only one fits.
const ORDER: Record<Exclude<Fix["action"], "claim">, number> = { remove: 0, replace: 1, add: 2, text: 3 };

async function main() {
  const fixes: Fix[] = JSON.parse(fs.readFileSync(REVIEW_FILE, "utf-8"));
  const claims = fixes.filter((f) => f.status === "approved" && f.action === "claim");
  const approved = fixes.filter((f) => f.status === "approved" && f.action !== "claim")
    .sort((a, b) => ORDER[a.action as keyof typeof ORDER] - ORDER[b.action as keyof typeof ORDER]);
  const counts = fixes.reduce<Record<string, number>>((m, f) => ((m[f.status] = (m[f.status] ?? 0) + 1), m), {});
  console.log(`${REVIEW_FILE}: ${JSON.stringify(counts)}`);
  if (claims.length) console.log(`${claims.length} approved fact-check item(s) need a manual rewrite — not applied here.`);
  if (!approved.length) return;

  let db: SupabaseClient | null = null;
  const jsonFiles = new Map<string, any[]>();
  const dbRows = new Map<string, Record<string, any>>(); // "table|slug" → row
  const problems: string[] = [];
  const done: Fix[] = [];

  for (const fix of approved) {
    const id = fix.record.slice(fix.record.indexOf(":") + 1);
    let rec: Record<string, any> | undefined;

    if (fix.where.startsWith("data/")) {
      if (!jsonFiles.has(fix.where)) jsonFiles.set(fix.where, JSON.parse(fs.readFileSync(fix.where, "utf-8")));
      rec = jsonFiles.get(fix.where)!.find((r) => String(r.id) === id);
    } else {
      const table = fix.where.replace("supabase:", "");
      const cacheKey = `${table}|${id}`;
      if (!dbRows.has(cacheKey)) {
        db ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
        const { data, error } = await db.from(table).select("*").eq("slug", id).single();
        if (error) { problems.push(`${fix.id}: ${table} ${id}: ${error.message}`); continue; }
        dbRows.set(cacheKey, data);
      }
      rec = dbRows.get(cacheKey);
    }
    if (!rec) { problems.push(`${fix.id}: record ${fix.record} not found`); continue; }

    const shape = fix.where === "data/timeline.json" ? "timeline" : fix.where === "supabase:art_artists" ? "website" : "array";
    const problem = applyFix(rec, fix, shape);
    if (problem) problems.push(`${fix.id} (${fix.record}): ${problem}`);
    else {
      done.push(fix);
      console.log(`${fix.id} ${fix.action.padEnd(7)} ${fix.record}  ${fix.oldUrl ?? fix.find ?? ""} → ${fix.newUrl ?? fix.replaceWith ?? "(removed)"}`);
    }
  }

  problems.forEach((p) => console.warn(`SKIPPED ${p}`));
  console.log(`\n${done.length} of ${approved.length} approved fixes ${APPLY ? "applied" : "would apply"}.`);
  if (!APPLY) { console.log("Dry run. Re-run with --apply to write."); return; }

  for (const [file, rows] of jsonFiles) fs.writeFileSync(file, JSON.stringify(rows, null, 2) + "\n");
  for (const [cacheKey, row] of dbRows) {
    const [table, slug] = cacheKey.split("|");
    const { id: _id, created_at: _c, ...update } = row;
    const { error } = await db!.from(table).update({ ...update, updated_at: new Date().toISOString() }).eq("slug", slug);
    if (error) console.error(`Supabase ${table} ${slug}: ${error.message}`);
  }
  const doneIds = new Set(done.map((f) => f.id));
  fs.writeFileSync(REVIEW_FILE, JSON.stringify(fixes.map((f) => (doneIds.has(f.id) ? { ...f, status: "applied" } : f)), null, 2) + "\n");
  console.log(`Wrote ${jsonFiles.size} JSON file(s), ${dbRows.size} Supabase row(s); marked ${done.length} items applied.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
