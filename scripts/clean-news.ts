#!/usr/bin/env npx tsx
/**
 * One-off cleanup: remove auto-fetched news items (since the daily job started)
 * whose URL is not on the trusted-outlet allowlist in fetch-news.ts.
 * Manually curated history before AUTO_START is never touched.
 *
 * Dry run: npx tsx scripts/clean-news.ts
 * Apply:   npx tsx scripts/clean-news.ts --apply   (backs up removed rows to data/news-removed-backup.json)
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const AUTO_START = "2026-03-07";
const APPLY = process.argv.includes("--apply");
const DATA_FILE = path.join(process.cwd(), "data", "news-timeline.json");
const BACKUP_FILE = path.join(process.cwd(), "data", "news-removed-backup.json");

interface NewsItem { date: string; headline: string; summary: string; source: string; url: string }

// Read the allowlist from fetch-news.ts so there is one source of truth.
const fetchSrc = fs.readFileSync(path.join(process.cwd(), "scripts", "fetch-news.ts"), "utf-8");
const listStart = fetchSrc.indexOf("TRUSTED_DOMAINS = [");
const TRUSTED_DOMAINS = [...fetchSrc.slice(listStart, fetchSrc.indexOf("];", listStart)).matchAll(/"([^"]+)"/g)].map((m) => m[1]);

function isTrusted(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return TRUSTED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

const shouldRemove = (i: NewsItem) => i.date >= AUTO_START && !isTrusted(i.url);

async function main() {
  const json: NewsItem[] = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: rows, error } = await db.from("news_timeline").select("*");
  if (error) throw error;

  const remove = new Map<string, NewsItem>();
  [...json, ...(rows as NewsItem[])].filter(shouldRemove).forEach((i) => remove.set(i.url, i));

  const bySource: Record<string, number> = {};
  remove.forEach((i) => (bySource[i.source] = (bySource[i.source] || 0) + 1));
  console.log(`To remove: ${remove.size} (JSON ${json.length}, Supabase ${rows!.length})`);
  console.table(Object.entries(bySource).sort((a, b) => b[1] - a[1]));

  if (!APPLY) {
    console.log("Dry run. Re-run with --apply to delete.");
    return;
  }

  fs.writeFileSync(BACKUP_FILE, JSON.stringify([...remove.values()], null, 2) + "\n");
  const urls = [...remove.keys()];
  let deleted = 0;
  for (let i = 0; i < urls.length; i += 50) {
    const { error: delErr, count } = await db.from("news_timeline").delete({ count: "exact" }).in("url", urls.slice(i, i + 50));
    if (delErr) throw delErr;
    deleted += count ?? 0;
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(json.filter((i) => !remove.has(i.url)), null, 2) + "\n");
  console.log(`Deleted ${deleted} Supabase rows, JSON now ${json.length - remove.size} items. Backup: ${BACKUP_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
