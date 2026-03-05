/**
 * Data access layer.
 * Reads from Supabase when configured, falls back to local JSON.
 */

import { createReadClient } from "./supabase/server";
import type { EUChapter, City, EUUkraineData, Myth, QuizQuestion, NewsItem, CulturalSite } from "./types";

// JSON fallbacks
import chaptersJSON from "@/data/euChapters.json";
import citiesJSON from "@/data/cities.json";
import dataJSON from "@/data/euUkraineData.json";
import mythsJSON from "@/data/myths.json";
import quizJSON from "@/data/quiz.json";
import newsJSON from "@/data/news-timeline.json";
import culturalSitesJSON from "@/data/cultural-sites.json";

function db() {
  return createReadClient();
}

export async function getChapters(): Promise<EUChapter[]> {
  const client = db();
  if (!client) return chaptersJSON as EUChapter[];
  const { data, error } = await client.from("eu_chapters").select("*").order("id");
  if (error || !data?.length) return chaptersJSON as EUChapter[];
  return data as EUChapter[];
}

export async function getCities(): Promise<City[]> {
  const client = db();
  if (!client) return citiesJSON as City[];
  const { data, error } = await client.from("cities").select("*");
  if (error || !data?.length) return citiesJSON as City[];
  return data.map((c: any) => ({
    ...c,
    notableFigures: c.notable_figures,
    europeanInfluences: c.european_influences,
    sources: c.sources ?? [],
  })) as City[];
}

export async function getEUData(): Promise<EUUkraineData> {
  const client = db();
  if (!client) return dataJSON as EUUkraineData;
  const { data, error } = await client.from("data_points").select("*").order("year");
  if (error || !data?.length) return dataJSON as EUUkraineData;

  const result: EUUkraineData = { tradeShare: [], students: [], assistance: [], tradeGrowth: [] };
  for (const row of data) {
    const cat = row.category as keyof EUUkraineData;
    if (result[cat]) result[cat].push({ year: row.year, value: row.value });
  }
  return result;
}

export async function getMyths(): Promise<Myth[]> {
  const client = db();
  if (!client) return mythsJSON as Myth[];
  const { data, error } = await client
    .from("myths")
    .select("*, myth_sources(*)")
    .order("id");
  if (error || !data?.length) return mythsJSON as Myth[];
  return data.map((m: any) => ({
    id: m.id,
    myth: m.myth,
    reality: m.reality,
    sources: (m.myth_sources || []).map((s: any) => ({ title: s.title, url: s.url })),
  }));
}

export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  const client = db();
  if (!client) return quizJSON as QuizQuestion[];
  const { data, error } = await client.from("quiz_questions").select("*").order("id");
  if (error || !data?.length) return quizJSON as QuizQuestion[];
  return data as QuizQuestion[];
}

export async function getCulturalSites(): Promise<CulturalSite[]> {
  return culturalSitesJSON as CulturalSite[];
}

export async function getNews(limit = 20): Promise<NewsItem[]> {
  const client = db();
  if (!client) return (newsJSON as NewsItem[]).slice(0, limit);
  const { data, error } = await client
    .from("news_timeline")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);
  if (error || !data?.length) return (newsJSON as NewsItem[]).slice(0, limit);
  return data as NewsItem[];
}
