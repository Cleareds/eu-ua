#!/usr/bin/env npx tsx
/**
 * Daily news fetcher: EU-Ukraine integration news
 * Run: npx tsx scripts/fetch-news.ts
 * Requires: NEWS_API_KEY and ANTHROPIC_API_KEY environment variables
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
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

  const query = encodeURIComponent("Ukraine EU accession integration European Union");
  const from = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const url = `https://newsapi.org/v2/everything?q=${query}&from=${from}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`NewsAPI error: ${res.status} ${res.statusText}`);
  const data = await res.json() as { articles: RawArticle[] };
  return data.articles || [];
}

async function summarizeArticle(client: Anthropic, article: RawArticle): Promise<string> {
  const text = article.description || article.content || article.title;
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 120,
    messages: [
      {
        role: "user",
        content: `Summarize this EU-Ukraine news article in exactly 2 clear, factual sentences. Be concise and neutral.\n\nTitle: ${article.title}\nContent: ${text}`,
      },
    ],
  });

  const content = msg.content[0];
  return content.type === "text" ? content.text.trim() : article.description || article.title;
}

async function main() {
  if (!ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set");
    process.exit(1);
  }

  console.log("Fetching latest EU-Ukraine news...");
  let articles: RawArticle[] = [];
  try {
    articles = await fetchLatestNews();
    console.log(`Found ${articles.length} articles`);
  } catch (err) {
    console.error("Failed to fetch news:", err);
    process.exit(1);
  }

  // Load existing entries
  const existing: NewsItem[] = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const existingUrls = new Set(existing.map((e) => e.url));

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const newEntries: NewsItem[] = [];

  for (const article of articles) {
    if (existingUrls.has(article.url)) {
      console.log(`Skipping (duplicate): ${article.title}`);
      continue;
    }

    try {
      console.log(`Summarizing: ${article.title}`);
      const summary = await summarizeArticle(client, article);
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

  // Prepend new entries
  const updated = [...newEntries, ...existing];
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
  console.log(`Added ${newEntries.length} new entries to news-timeline.json`);
}

main().catch(console.error);
