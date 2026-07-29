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
import quizPeopleJSON from "@/data/quiz-people.json";
import quizPlacesJSON from "@/data/quiz-places.json";
import quizHeritageJSON from "@/data/quiz-heritage.json";
import newsJSON from "@/data/news-timeline.json";
import culturalSitesJSON from "@/data/cultural-sites.json";

function db() {
  return createReadClient();
}

/**
 * Reference datasets below read from the JSON in `data/`, not from Supabase.
 *
 * These used to prefer Supabase and fall back to JSON, but nothing ever writes to
 * those tables — there is no admin UI for chapters, cities, myths, quiz questions
 * or data points, so the only way to edit them is to change the JSON here and
 * redeploy. The DB copies were seeded once (March 2026) and then rotted, and
 * because a non-empty table won the fallback check, the live site silently served
 * the stale copy: 6 myths instead of 12, 12 cities instead of 30, 5 quiz questions
 * instead of 20, and accession chapters frozen at their March statuses using a
 * status vocabulary the UI no longer renders. Two `data:` commits in June 2026
 * updated the JSON and changed nothing in production.
 *
 * Some tables also can't represent the JSON: `cities` has no `status` or `image`
 * column, so a DB-sourced city loses its occupied/liberated state.
 *
 * `getNews` below still reads the DB, correctly — scripts/fetch-news.ts writes to
 * `news_timeline` daily, so there the DB genuinely is the fresher source. Art and
 * people also stay DB-backed; both have admin UIs that write to them.
 */

export async function getChapters(): Promise<EUChapter[]> {
  return chaptersJSON as EUChapter[];
}

export async function getCities(): Promise<City[]> {
  return citiesJSON as City[];
}

export async function getEUData(): Promise<EUUkraineData> {
  return dataJSON as EUUkraineData;
}

export async function getMyths(): Promise<Myth[]> {
  return mythsJSON as Myth[];
}

export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  return quizJSON as QuizQuestion[];
}

export async function getAllQuizCategories(): Promise<{
  general: QuizQuestion[];
  people: QuizQuestion[];
  places: QuizQuestion[];
  heritage: QuizQuestion[];
}> {
  return {
    general: quizJSON as QuizQuestion[],
    people: quizPeopleJSON as QuizQuestion[],
    places: quizPlacesJSON as QuizQuestion[],
    heritage: quizHeritageJSON as QuizQuestion[],
  };
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
