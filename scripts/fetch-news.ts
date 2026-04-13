#!/usr/bin/env npx tsx
/**
 * Daily news fetcher: EU-Ukraine integration news
 * Fetches from NewsAPI, summarizes with Claude, writes to Supabase (and JSON fallback).
 * Run: npx tsx scripts/fetch-news.ts
 * Requires: NEWS_API_KEY, ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DATA_FILE = path.join(process.cwd(), "data", "news-timeline.json");

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

async function fetchLatestNews(): Promise<RawArticle[]> {
  if (!NEWS_API_KEY) throw new Error("NEWS_API_KEY not set");
  const query = encodeURIComponent('Ukraine AND ("EU accession" OR "European Union" OR "EU integration" OR "EU membership" OR "European integration" OR "EU sanctions" OR "EU enlargement" OR "EU defense" OR "European Peace Facility" OR "EUMAM Ukraine")');
  const from = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const url = `https://newsapi.org/v2/everything?q=${query}&from=${from}&language=en&sortBy=relevancy&pageSize=20&apiKey=${NEWS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NewsAPI error: ${res.status} ${res.statusText}`);
  const data = await res.json() as { articles: RawArticle[] };
  return data.articles || [];
}

// Low-quality sources to exclude
const EXCLUDED_SOURCES = new Set([
  "rt.com", "sputniknews.com",
]);

function isRelevantSource(article: RawArticle): boolean {
  const urlLower = article.url.toLowerCase();
  for (const excluded of EXCLUDED_SOURCES) {
    if (urlLower.includes(excluded)) return false;
  }
  return true;
}

async function summarizeArticle(client: Anthropic, article: RawArticle): Promise<string> {
  const text = article.description || article.content || article.title;
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 120,
    messages: [{
      role: "user",
      content: `Write exactly 2 factual sentences summarizing this EU-Ukraine news article. Do NOT start with "Summary:" or any prefix — just the sentences. If the article is not about EU-Ukraine relations, respond with exactly "IRRELEVANT".\n\nTitle: ${article.title}\nContent: ${text}`,
    }],
  });
  const content = msg.content[0];
  return content.type === "text" ? content.text.trim() : article.description || article.title;
}

async function main() {
  if (!ANTHROPIC_API_KEY) { console.error("ANTHROPIC_API_KEY not set"); process.exit(1); }

  console.log("Fetching latest EU-Ukraine news...");
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

  // Try Supabase first
  let dbClient = SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

  if (dbClient) {
    const { data } = await dbClient.from("news_timeline").select("url");
    data?.forEach((r: any) => existingUrls.add(r.url));
  } else {
    // Fallback: read from JSON
    const existing: NewsItem[] = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    existing.forEach((e) => existingUrls.add(e.url));
  }

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const newEntries: NewsItem[] = [];

  for (const article of articles) {
    if (existingUrls.has(article.url)) {
      console.log(`Skipping (duplicate): ${article.title}`);
      continue;
    }
    if (!isRelevantSource(article)) {
      console.log(`Skipping (excluded source): ${article.source.name}`);
      continue;
    }
    try {
      console.log(`Summarizing: ${article.title}`);
      const summary = await summarizeArticle(anthropic, article);
      if (summary === "IRRELEVANT") {
        console.log(`Skipping (irrelevant content): ${article.title}`);
        continue;
      }
      newEntries.push({
        date: article.publishedAt.split("T")[0],
        headline: article.title,
        summary,
        source: article.source.name,
        url: article.url,
      });
    } catch (err) {
      console.error(`Failed to summarize: ${article.title}`, err);
    }
  }

  if (newEntries.length === 0) {
    console.log("No new entries to add.");
    return;
  }

  // Write to Supabase if available
  if (dbClient) {
    const { error } = await dbClient.from("news_timeline").upsert(
      newEntries.map((e) => ({ ...e, date: e.date })),
      { onConflict: "url" }
    );
    if (error) console.error("Supabase write error:", error);
    else console.log(`Added ${newEntries.length} new entries to Supabase`);
  }

  // Always also update the JSON file as backup
  const existing: NewsItem[] = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const updated = [...newEntries, ...existing];
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
  console.log(`Also updated news-timeline.json (${newEntries.length} new entries)`);
}

main().catch(console.error);
