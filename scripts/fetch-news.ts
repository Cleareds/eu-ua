#!/usr/bin/env npx tsx
/**
 * Daily news fetcher: EU-Ukraine integration news
 * Fetches from NewsAPI (trusted outlets only), filters for EU-Ukraine relevance,
 * writes to Supabase (and JSON fallback). No paid API needed.
 *
 * Run:      npx tsx scripts/fetch-news.ts
 * Backfill: DAYS_BACK=30 npx tsx scripts/fetch-news.ts   (NewsAPI free plan: max 30 days)
 * Dry run:  DRY_RUN=1 npx tsx scripts/fetch-news.ts      (prints entries, writes nothing)
 *
 * Requires: NEWS_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or anon key)
 * Optional: LLM_API_KEY (+ LLM_API_URL, LLM_MODEL) for any OpenAI-compatible chat API,
 *           e.g. Gemini's free tier. Without it (or if the call fails) a keyword
 *           filter + the NewsAPI description are used instead.
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_API_URL = process.env.LLM_API_URL || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const LLM_MODEL = process.env.LLM_MODEL || "gemini-2.5-flash";
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

// Editorially trusted outlets. NewsAPI only searches these, and results are re-checked by hostname.
const TRUSTED_DOMAINS = [
  // Wires + international
  "reuters.com", "apnews.com", "bbc.co.uk", "bbc.com", "theguardian.com", "ft.com", "economist.com",
  "nytimes.com", "washingtonpost.com", "bloomberg.com", "aljazeera.com", "npr.org", "cbc.ca",
  "abcnews.go.com", "abcnews.com", "cbsnews.com", "abc.net.au", "time.com", "theatlantic.com", "foreignpolicy.com",
  "channelnewsasia.com",
  // European
  "politico.eu", "euronews.com", "euractiv.com", "euobserver.com", "dw.com", "france24.com",
  "lemonde.fr", "rte.ie", "irishtimes.com", "thejournal.ie", "nrc.nl", "notesfrompoland.com",
  "lrt.lt", "err.ee", "balkaninsight.com", "rferl.org",
  // Ukrainian
  "kyivindependent.com", "pravda.com.ua", "kyivpost.com", "ukrinform.net", "president.gov.ua",
  // Official EU + analysis
  "europa.eu", "consilium.europa.eu", "ec.europa.eu", "eeas.europa.eu",
  "theconversation.com", "warontherocks.com", "atlanticcouncil.org", "ecfr.eu",
];

const isoDay = (d: Date) => d.toISOString().split("T")[0];

async function fetchNewsApi(from: string, to?: string): Promise<RawArticle[]> {
  if (!NEWS_API_KEY) throw new Error("NEWS_API_KEY not set");
  const params = new URLSearchParams({
    q: QUERY, from, language: "en", sortBy: "relevancy", pageSize: "20", apiKey: NEWS_API_KEY,
    domains: TRUSTED_DOMAINS.join(","),
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

function isTrustedSource(article: RawArticle): boolean {
  try {
    const host = new URL(article.url).hostname.replace(/^www\./, "");
    return TRUSTED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

/** Strip NewsAPI's "[+1234 chars]" tails and stray HTML from descriptions. */
function cleanText(text: string): string {
  return text.replace(/\s*\[\+\d+ chars\]$/, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

// Fallback relevance check when no model is available: the article itself must name both Ukraine and the EU.
const EU_PATTERN = /\b(EU|Europe|European|E\.U\.|European Union|Brussels|European Commission|European Council|European Parliament|von der Leyen|Kallas|Marta Kos)\b/;
const UA_PATTERN = /Ukrain|Kyiv|Zelensk/i;

function fallbackSummary(article: RawArticle): string | null {
  const text = cleanText(article.description || "");
  const all = `${article.title} ${text}`;
  if (!text || !EU_PATTERN.test(all) || !UA_PATTERN.test(all)) return null;
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
  const res = await fetch(LLM_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${LLM_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LLM_MODEL,
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
  if (!res.ok) throw new Error(`LLM API error: ${res.status} ${await res.text()}`);
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
    if (!isTrustedSource(article)) {
      console.log(`Skipping (untrusted source): ${article.source.name}`);
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
    if (LLM_API_KEY) {
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

  if (modelFailures) console.log(`::warning::${modelFailures} model batch(es) failed — used keyword fallback`);

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
