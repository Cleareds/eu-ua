#!/usr/bin/env npx tsx
/**
 * Daily news fetcher: EU-Ukraine integration news
 * Fetches from NewsAPI, filters + summarizes with GitHub Models (free in Actions),
 * writes to Supabase (and JSON fallback).
 *
 * Run:      npx tsx scripts/fetch-news.ts
 * Backfill: DAYS_BACK=30 npx tsx scripts/fetch-news.ts   (NewsAPI free plan: max 30 days)
 * Dry run:  DRY_RUN=1 npx tsx scripts/fetch-news.ts      (prints entries, writes nothing)
 *
 * Requires: NEWS_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or anon key)
 * Optional: GITHUB_TOKEN with `models: read`. Without it (or if the model call fails)
 *           a keyword filter + the NewsAPI description are used instead.
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MODEL = process.env.NEWS_MODEL || "openai/gpt-4.1-mini";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DAYS_BACK = Number(process.env.DAYS_BACK || 0);
const DRY_RUN = !!process.env.DRY_RUN;
const DATA_FILE = path.join(process.cwd(), "data", "news-timeline.json");
const BATCH_SIZE = 10;

interface RawArticle {
  title: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  description?: string;
  content?: string;
}

interface NewsItem {
  date: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
}

const QUERY = 'Ukraine AND ("EU accession" OR "European Union" OR "EU integration" OR "EU membership" OR "European integration" OR "EU sanctions" OR "EU enlargement" OR "EU defense" OR "European Peace Facility" OR "EUMAM Ukraine")';

const isoDay = (d: Date) => d.toISOString().split("T")[0];

async function fetchNewsApi(from: string, to?: string): Promise<RawArticle[]> {
  if (!NEWS_API_KEY) throw new Error("NEWS_API_KEY not set");
  const params = new URLSearchParams({
    q: QUERY, from, language: "en", sortBy: "relevancy", pageSize: "20", apiKey: NEWS_API_KEY,
  });
  if (to) params.set("to", to);
  const res = await fetch(`https://newsapi.org/v2/everything?${params}`);
  if (!res.ok) throw new Error(`NewsAPI error: ${res.status} ${await res.text()}`);
  const data = await res.json() as { articles: RawArticle[] };
  return data.articles || [];
}

/** Daily run: one query over the last 5 days. Backfill: one query per day so older days get their own top 20. */
async function fetchLatestNews(): Promise<RawArticle[]> {
  if (!DAYS_BACK) return fetchNewsApi(isoDay(new Date(Date.now() - 5 * 86400000)));
  const all: RawArticle[] = [];
  for (let i = DAYS_BACK; i >= 0; i--) {
    const day = isoDay(new Date(Date.now() - i * 86400000));
    try {
      all.push(...await fetchNewsApi(day, day));
    } catch (err) {
      console.warn(`Skipping ${day}:`, (err as Error).message);
    }
  }
  return all;
}

// Kremlin-aligned / disinformation sources to exclude (matched against the URL)
const EXCLUDED_SOURCES = new Set([
  "rt.com", "sputniknews.com", "sputnikglobe.com", "sputnik", "tass.com", "tass.ru", "ria.ru",
  "globalresearch.ca", "strategic-culture", "southfront", "news-front", "pravda-en.com",
]);

function isRelevantSource(article: RawArticle): boolean {
  const urlLower = article.url.toLowerCase();
  for (const excluded of EXCLUDED_SOURCES) {
    if (urlLower.includes(excluded)) return false;
  }
  return true;
}

/** Strip NewsAPI's "[+1234 chars]" tails and stray HTML from descriptions. */
function cleanText(text: string): string {
  return text.replace(/\s*\[\+\d+ chars\]$/, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

// Fallback relevance check when the model is unavailable: the article itself must talk about the EU.
const EU_PATTERN = /\b(EU|European Union|Brussels|European Commission|European Council|European Parliament|accession|enlargement|von der Leyen|Kallas|Kos)\b/i;

function fallbackSummary(article: RawArticle): string | null {
  const text = cleanText(article.description || "");
  if (!text || !EU_PATTERN.test(`${article.title} ${text}`)) return null;
  return text;
}

/**
 * Classify + summarize a batch in one request. Returns a summary per article index,
 * or null when the article is not about EU-Ukraine relations.
 */
async function summarizeBatch(batch: RawArticle[]): Promise<(string | null)[]> {
  const items = batch.map((a, i) => ({
    id: i,
    title: a.title,
    text: cleanText(a.description || a.content || ""),
  }));
  const res = await fetch("https://models.github.ai/inference/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You curate a news timeline about EU-Ukraine relations (accession, sanctions, aid, defence cooperation, trade, energy, reconstruction). For each article decide if it is mainly about EU-Ukraine relations. General war reports, US-only diplomacy, or other countries' domestic news are NOT relevant. For relevant articles write exactly 2 factual sentences using ONLY facts stated in the given title and text — never add dates, names, numbers or background from your own knowledge. Reply as JSON: {\"results\":[{\"id\":0,\"relevant\":true,\"summary\":\"...\"}]}",
        },
        { role: "user", content: JSON.stringify(items) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`GitHub Models error: ${res.status} ${await res.text()}`);
  const data = await res.json() as { choices: { message: { content: string } }[] };
  const parsed = JSON.parse(data.choices[0].message.content) as {
    results: { id: number; relevant: boolean; summary?: string }[];
  };
  const out: (string | null)[] = batch.map(() => null);
  for (const r of parsed.results) {
    if (r.relevant && r.summary && out[r.id] === null) out[r.id] = r.summary.trim();
  }
  return out;
}

async function main() {
  console.log(`Fetching latest EU-Ukraine news${DAYS_BACK ? ` (backfill ${DAYS_BACK} days)` : ""}...`);
  let articles: RawArticle[] = [];
  try {
    articles = await fetchLatestNews();
    console.log(`Found ${articles.length} articles`);
  } catch (err) {
    console.error("Failed to fetch news:", err);
    process.exit(1);
  }

  // Load existing URLs to deduplicate
  const existingUrls = new Set<string>();
  const existing: NewsItem[] = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  existing.forEach((e) => existingUrls.add(e.url));

  const dbClient = SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

  if (dbClient) {
    const { data } = await dbClient.from("news_timeline").select("url");
    data?.forEach((r: { url: string }) => existingUrls.add(r.url));
  }

  const candidates: RawArticle[] = [];
  for (const article of articles) {
    if (existingUrls.has(article.url)) continue;
    if (!isRelevantSource(article)) {
      console.log(`Skipping (excluded source): ${article.source.name}`);
      continue;
    }
    if (!article.title || article.title === "[Removed]") continue;
    existingUrls.add(article.url); // also dedupes within this run
    candidates.push(article);
  }
  console.log(`${candidates.length} new candidate articles`);

  const newEntries: NewsItem[] = [];
  let modelFailures = 0;

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);
    let summaries: (string | null)[];
    if (GITHUB_TOKEN) {
      try {
        summaries = await summarizeBatch(batch);
      } catch (err) {
        modelFailures++;
        console.error("Model summarization failed, using fallback:", (err as Error).message);
        summaries = batch.map(fallbackSummary);
      }
    } else {
      summaries = batch.map(fallbackSummary);
    }

    batch.forEach((article, j) => {
      const summary = summaries[j];
      if (!summary) {
        console.log(`Skipping (irrelevant): ${article.title}`);
        return;
      }
      newEntries.push({
        date: article.publishedAt.split("T")[0],
        headline: article.title,
        summary,
        source: article.source.name,
        url: article.url,
      });
    });
  }

  if (!GITHUB_TOKEN) console.log("::warning::GITHUB_TOKEN not set — used keyword fallback instead of the model");
  else if (modelFailures) console.log(`::warning::${modelFailures} model batch(es) failed — used keyword fallback`);

  if (newEntries.length === 0) {
    console.log("No new entries to add.");
    return;
  }

  if (DRY_RUN) {
    newEntries.forEach((e) => console.log(`\n[${e.date}] ${e.headline} (${e.source})\n  ${e.summary}`));
    console.log(`\nDRY_RUN: ${newEntries.length} entries, nothing written.`);
    return;
  }

  // Write to Supabase if available
  if (dbClient) {
    const { error } = await dbClient.from("news_timeline").upsert(newEntries, { onConflict: "url" });
    if (error) {
      console.error("Supabase write error:", error);
      process.exitCode = 1;
    } else console.log(`Added ${newEntries.length} new entries to Supabase`);
  }

  // Always also update the JSON file as backup, newest first
  const updated = [...newEntries, ...existing].sort((a, b) => b.date.localeCompare(a.date));
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2) + "\n");
  console.log(`Also updated news-timeline.json (${newEntries.length} new entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
