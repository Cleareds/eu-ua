#!/usr/bin/env npx tsx
/**
 * Content audit — read-only. Changes nothing in the repo data or in Supabase.
 *
 * Reads exactly what the live site shows (JSON reference data + published people/art
 * rows from Supabase) and reports:
 *   - records without sources, without an image, or with very short text
 *   - Russian-transliterated place names (Kiev, Kharkov, Odessa, …) in site text
 *   - suggested cross-links between records (person ↔ artist, person ↔ city, …)
 *   - with --links: source URLs that are broken or unreachable
 *
 * Run:  npx tsx scripts/audit-content.ts            (fast, no network except Supabase)
 *       npx tsx scripts/audit-content.ts --links    (also checks every source URL)
 * Output: reports/content-audit.md (for people) + reports/content-audit.json (for tooling)
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const CHECK_LINKS = process.argv.includes("--links");
const OUT_DIR = path.join(process.cwd(), "reports");
const THIN_TEXT = 120;

type Kind = "city" | "site" | "diaspora" | "person" | "myth" | "timeline" | "artist" | "artwork" | "wave";

const KIND_LABEL: Record<Kind, string> = {
  city: "Cities", site: "Damaged cultural sites", diaspora: "Diaspora heritage", person: "People",
  myth: "Myths", timeline: "Timeline events", artist: "Artists", artwork: "Artworks", wave: "Art waves",
};

// Where each kind lives, so the editor knows where to fix it.
const KIND_HOME: Record<Kind, string> = {
  city: "data/cities.json", site: "data/cultural-sites.json", diaspora: "data/diaspora-heritage.json",
  myth: "data/myths.json", timeline: "data/timeline.json",
  person: "Supabase people (admin)", artist: "Supabase art_artists (admin)",
  artwork: "Supabase art_objects (admin)", wave: "Supabase art_waves (admin)",
};

interface Entity {
  key: string;          // "person:taras-shevchenko"
  kind: Kind;
  id: string;
  name: string;
  text: string;         // all prose, for mention matching and length checks
  textLength: number;   // main description only
  sources: string[];    // URLs; empty = none
  hasSourceField: boolean;
  image: string | null;
  hasImageField: boolean;
  place: string | null; // birthplace / city / location
  url: string | null;   // page on the site, when one exists
  linkedTo: string[];   // links that already exist in the data (artwork → artist)
}

interface Suggestion { from: string; to: string; reason: string; confidence: "high" | "medium" | "low" }

const readJSON = <T>(file: string): T => JSON.parse(fs.readFileSync(path.join(process.cwd(), file), "utf-8"));
const urls = (s?: { url?: string }[] | null) => (s ?? []).map((x) => x.url).filter((u): u is string => !!u);
const join = (...parts: (string | string[] | null | undefined)[]) =>
  parts.flat().filter(Boolean).join(" \n ");

function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[’'`ʼ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function mentions(haystack: string, needle: string): boolean {
  if (!needle) return false;
  return ` ${norm(haystack)} `.includes(` ${norm(needle)} `);
}

// ── Load ────────────────────────────────────────────────────────────────────

async function load(): Promise<Entity[]> {
  const out: Entity[] = [];

  for (const c of readJSON<any[]>("data/cities.json")) {
    out.push({
      key: `city:${c.id}`, kind: "city", id: c.id, name: c.name,
      text: join(c.description, c.connections, c.europeanInfluences, c.notableFigures),
      textLength: (c.description ?? "").length, sources: urls(c.sources), hasSourceField: true,
      image: c.image ?? null, hasImageField: true, place: c.name, url: null, linkedTo: [],
    });
  }
  for (const s of readJSON<any[]>("data/cultural-sites.json")) {
    out.push({
      key: `site:${s.id}`, kind: "site", id: s.id, name: s.name, text: join(s.description),
      textLength: (s.description ?? "").length, sources: urls(s.sources), hasSourceField: true,
      image: s.image ?? null, hasImageField: true, place: s.city, url: null, linkedTo: [],
    });
  }
  for (const d of readJSON<any[]>("data/diaspora-heritage.json")) {
    out.push({
      key: `diaspora:${d.id}`, kind: "diaspora", id: d.id, name: d.name,
      text: join(d.description, d.ukrainianConnection), textLength: (d.description ?? "").length,
      sources: urls(d.sources), hasSourceField: true, image: d.image ?? null, hasImageField: true,
      place: `${d.city}, ${d.country}`, url: null, linkedTo: [],
    });
  }
  for (const m of readJSON<any[]>("data/myths.json")) {
    out.push({
      key: `myth:${m.id}`, kind: "myth", id: String(m.id), name: m.myth, text: join(m.myth, m.reality),
      textLength: (m.reality ?? "").length, sources: urls(m.sources), hasSourceField: true,
      image: null, hasImageField: false, place: null, url: null, linkedTo: [],
    });
  }
  for (const t of readJSON<any[]>("data/timeline.json")) {
    out.push({
      key: `timeline:${t.id}`, kind: "timeline", id: t.id, name: `${t.year} — ${t.title}`,
      text: join(t.title, t.description), textLength: (t.description ?? "").length,
      sources: t.sourceUrl ? [t.sourceUrl] : [], hasSourceField: true,
      image: null, hasImageField: false, place: null, url: null, linkedTo: [],
    });
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("Supabase env not set — people and art are skipped.");
    return out;
  }
  // Anon key on purpose: RLS returns only published rows, i.e. what visitors see.
  const db = createClient(SUPABASE_URL, SUPABASE_KEY);
  const select = async (table: string) => {
    const { data, error } = await db.from(table).select("*").eq("published", true);
    if (error) throw new Error(`${table}: ${error.message}`);
    return data as any[];
  };

  for (const p of await select("people")) {
    out.push({
      key: `person:${p.slug}`, kind: "person", id: p.slug, name: p.name,
      text: join(p.description, p.european_connections, p.role), textLength: (p.description ?? "").length,
      sources: urls(p.sources), hasSourceField: true, image: p.profile_image_url, hasImageField: true,
      place: p.birthplace, url: null, linkedTo: [],
    });
  }
  const artists = await select("art_artists");
  const artistKeyById = new Map(artists.map((a) => [a.id, `artist:${a.slug}`]));
  for (const a of artists) {
    out.push({
      key: `artist:${a.slug}`, kind: "artist", id: a.slug, name: a.name,
      text: join(a.short_bio, a.full_bio), textLength: (a.full_bio || a.short_bio || "").length,
      sources: a.website_url ? [a.website_url] : [], hasSourceField: false,
      image: a.profile_image_url, hasImageField: true, place: a.birth_place,
      url: `/ukrainian-art/artists/${a.slug}`, linkedTo: [],
    });
  }
  for (const w of await select("art_waves")) {
    out.push({
      key: `wave:${w.slug}`, kind: "wave", id: w.slug, name: w.name,
      text: join(w.description, w.full_description), textLength: (w.full_description || w.description || "").length,
      sources: [], hasSourceField: false, image: w.cover_image_url, hasImageField: true, place: null,
      url: `/ukrainian-art/waves/${w.slug}`, linkedTo: [],
    });
  }
  for (const o of await select("art_objects")) {
    out.push({
      key: `artwork:${o.slug}`, kind: "artwork", id: o.slug, name: o.title,
      text: join(o.short_description, o.full_description, o.location),
      textLength: (o.full_description || o.short_description || "").length,
      sources: o.image_source_page ? [o.image_source_page] : [], hasSourceField: false,
      image: o.image_url, hasImageField: true, place: o.location, url: `/ukrainian-art/art/${o.slug}`,
      linkedTo: o.artist_id && artistKeyById.has(o.artist_id) ? [artistKeyById.get(o.artist_id)!] : [],
    });
  }
  return out;
}

// ── Checks ──────────────────────────────────────────────────────────────────

// Russian-imperial / Soviet transliterations. Fine inside a quoted historical name,
// so this is a review list, not an error list.
const RUSSIAN_SPELLINGS: [RegExp, string][] = [
  [/\bKiev\b/g, "Kyiv"], [/\bKharkov\b/g, "Kharkiv"], [/\bOdessa\b/g, "Odesa"], [/\bLvov\b/g, "Lviv"],
  [/\bChernigov\b/g, "Chernihiv"], [/\bNikolaev\b/g, "Mykolaiv"], [/\bZaporozhye\b/g, "Zaporizhzhia"],
  [/\bRovno\b/g, "Rivne"], [/\bVinnitsa\b/g, "Vinnytsia"], [/\bZhitomir\b/g, "Zhytomyr"],
  [/\bLugansk\b/g, "Luhansk"], [/\bChernobyl\b/g, "Chornobyl"], [/\bDnepr\b/g, "Dnipro"],
  [/\bthe Ukraine\b/gi, "Ukraine"],
];

function russianSpellings(e: Entity): string[] {
  const hits = new Set<string>();
  for (const [re, fix] of RUSSIAN_SPELLINGS) {
    for (const m of `${e.name} ${e.text}`.matchAll(re)) hits.add(`${m[0]} → ${fix}`);
  }
  return [...hits];
}

function surname(name: string): string {
  const parts = norm(name).split(" ");
  return parts[parts.length - 1];
}

function suggestLinks(all: Entity[]): Suggestion[] {
  const out = new Map<string, Suggestion>();
  const add = (a: Entity, b: Entity, reason: string, confidence: Suggestion["confidence"]) => {
    if (a.key === b.key || a.linkedTo.includes(b.key) || b.linkedTo.includes(a.key)) return;
    const [from, to] = [a.key, b.key].sort();
    const id = `${from}|${to}`;
    const prev = out.get(id);
    const rank = { high: 3, medium: 2, low: 1 };
    if (!prev || rank[confidence] > rank[prev.confidence]) out.set(id, { from, to, reason, confidence });
  };

  const people = all.filter((e) => e.kind === "person" || e.kind === "artist");
  const cities = all.filter((e) => e.kind === "city");
  const surnameCount = new Map<string, number>();
  for (const p of people) surnameCount.set(surname(p.name), (surnameCount.get(surname(p.name)) ?? 0) + 1);

  // Same human in People and in Art
  for (const p of all.filter((e) => e.kind === "person")) {
    for (const a of all.filter((e) => e.kind === "artist")) {
      if (norm(p.name) === norm(a.name)) add(p, a, "same name in People and Art", "high");
      else if (surname(p.name) === surname(a.name) && norm(p.name)[0] === norm(a.name)[0])
        add(p, a, "same surname + initial in People and Art", "medium");
    }
  }

  // Person/artist born in, or site located in, a city we have
  for (const e of all) {
    if (!e.place || e.kind === "city") continue;
    for (const c of cities) {
      if (mentions(e.place, c.name)) add(e, c, `${e.kind === "site" ? "located in" : "place"}: ${e.place}`, "high");
    }
  }

  // Mentions in prose
  for (const e of all) {
    for (const p of people) {
      if (p.key === e.key) continue;
      if (mentions(e.text, p.name)) add(e, p, `text names "${p.name}"`, "high");
      else {
        const s = surname(p.name);
        if (s.length >= 5 && surnameCount.get(s) === 1 && mentions(e.text, s))
          add(e, p, `text names surname "${s}"`, "low");
      }
    }
    if (e.kind !== "city") {
      for (const c of cities) {
        if (e.place && mentions(e.place, c.name)) continue; // already linked above
        if (mentions(e.text, c.name)) add(e, c, `text names "${c.name}"`, "medium");
      }
    }
  }
  return [...out.values()];
}

// ── Link checking ───────────────────────────────────────────────────────────

type LinkStatus = "ok" | "broken" | "blocked" | "error";

async function checkUrl(url: string): Promise<{ status: LinkStatus; code: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, {
      method: "GET", redirect: "follow", signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; eu-ua-content-audit/1.0; +https://www.eu-ua.com)" },
    });
    res.body?.cancel().catch(() => {});
    const code = String(res.status);
    if (res.ok) return { status: "ok", code };
    if ([404, 410].includes(res.status)) return { status: "broken", code };
    if ([401, 403, 405, 429, 999].includes(res.status)) return { status: "blocked", code };
    return { status: "error", code };
  } catch (err) {
    const msg = (err as Error).name === "AbortError" ? "timeout" : ((err as any).cause?.code ?? (err as Error).message);
    return { status: msg === "ENOTFOUND" ? "broken" : "error", code: msg };
  } finally {
    clearTimeout(timer);
  }
}

async function checkLinks(all: Entity[]): Promise<Map<string, { status: LinkStatus; code: string }>> {
  const unique = [...new Set(all.flatMap((e) => e.sources))].filter((u) => /^https?:\/\//.test(u));
  const results = new Map<string, { status: LinkStatus; code: string }>();
  let i = 0;
  const worker = async () => {
    while (i < unique.length) {
      const url = unique[i++];
      results.set(url, await checkUrl(url));
      process.stdout.write(`\rChecked ${results.size}/${unique.length} links`);
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  process.stdout.write("\n");
  return results;
}

// ── Report ──────────────────────────────────────────────────────────────────

async function main() {
  const all = await load();
  const kinds = [...new Set(all.map((e) => e.kind))] as Kind[];

  const noSource = all.filter((e) => e.hasSourceField && e.sources.length === 0);
  const noImage = all.filter((e) => e.hasImageField && !e.image);
  const thin = all.filter((e) => e.textLength < THIN_TEXT);
  const spellings = all.map((e) => ({ e, hits: russianSpellings(e) })).filter((x) => x.hits.length);
  const dupIds = Object.entries(
    all.reduce<Record<string, number>>((m, e) => ((m[e.key] = (m[e.key] ?? 0) + 1), m), {}),
  ).filter(([, n]) => n > 1);
  const suggestions = suggestLinks(all);
  const links = CHECK_LINKS ? await checkLinks(all) : null;

  const badLinks = links
    ? all.flatMap((e) => e.sources.map((u) => ({ e, u, r: links.get(u) })))
        .filter((x) => x.r && (x.r.status === "broken" || x.r.status === "error"))
    : [];
  const blockedLinks = links ? [...links.values()].filter((r) => r.status === "blocked").length : 0;

  // JSON for tooling (step 6 — links layer — starts from `suggestions`)
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "content-audit.json"), JSON.stringify({
    generatedAt: new Date().toISOString(),
    counts: Object.fromEntries(kinds.map((k) => [k, all.filter((e) => e.kind === k).length])),
    noSource: noSource.map((e) => e.key),
    noImage: noImage.map((e) => e.key),
    thinText: thin.map((e) => ({ key: e.key, length: e.textLength })),
    russianSpellings: spellings.map((x) => ({ key: x.e.key, hits: x.hits })),
    duplicateKeys: dupIds.map(([k]) => k),
    links: links ? Object.fromEntries(links) : null,
    suggestions,
  }, null, 2) + "\n");

  // Markdown for the editor
  const md: string[] = [];
  const line = (s = "") => md.push(s);
  const label = (e: Entity) => `**${e.name.length > 90 ? e.name.slice(0, 87) + "…" : e.name}** \`${e.key}\``;
  const groupBy = (list: Entity[], render: (e: Entity) => string) => {
    for (const k of kinds) {
      const items = list.filter((e) => e.kind === k);
      if (!items.length) continue;
      line(`#### ${KIND_LABEL[k]} (${items.length}) — edit in ${KIND_HOME[k]}`);
      items.forEach((e) => line(`- ${render(e)}`));
      line();
    }
  };

  line("# Content audit");
  line(`Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC. Read-only: this report changed nothing.`);
  line();
  line("## Summary");
  line();
  line("| Section | Records | No source | No image | Short text (<120 chars) |");
  line("|---|---:|---:|---:|---:|");
  for (const k of kinds) {
    const n = (list: Entity[]) => list.filter((e) => e.kind === k).length;
    const base = all.find((e) => e.kind === k)!;
    line(`| ${KIND_LABEL[k]} | ${n(all)} | ${base.hasSourceField ? n(noSource) : "no field"} | ${base.hasImageField ? n(noImage) : "—"} | ${n(thin)} |`);
  }
  line();
  line(`- Russian-style spellings to review: **${spellings.length}** records`);
  line(`- Suggested cross-links: **${suggestions.length}** (${suggestions.filter((s) => s.confidence === "high").length} high confidence)`);
  if (links) line(`- Source links checked: **${links.size}** — ${badLinks.length} broken or failing, ${blockedLinks} blocked automated checks (open by hand)`);
  else line("- Source links: not checked (run with `--links`)");
  if (dupIds.length) line(`- Duplicate IDs: ${dupIds.map(([k]) => `\`${k}\``).join(", ")}`);
  line();
  line("> **Art has no source field.** Artists, artworks and waves cannot cite where their facts come from. " +
    "Step 5 (optional fields) adds this. Until then, artworks count `image_source_page` as their only source.");
  line();

  line("## 1. Records without sources");
  line();
  groupBy(noSource, label);

  if (links) {
    line("## 2. Broken or failing source links");
    line();
    if (!badLinks.length) line("None.");
    badLinks.forEach(({ e, u, r }) => line(`- ${label(e)} — ${r!.code} — ${u}`));
    line();
  }

  line("## 3. Russian-style spellings to review");
  line();
  line("Keep them only inside historical names or quotes (e.g. \"Kiev Pechersk Lavra\" in an old title).");
  line();
  spellings.forEach(({ e, hits }) => line(`- ${label(e)} — ${hits.join(", ")} — ${KIND_HOME[e.kind]}`));
  line();

  line("## 4. Short descriptions (< 120 characters)");
  line();
  groupBy(thin, (e) => `${label(e)} — ${e.textLength} chars`);

  line("## 5. Records without an image");
  line();
  groupBy(noImage, label);

  line("## 6. Suggested cross-links");
  line();
  line("Candidates for the links layer (step 6). High = exact name or place match. Low = surname only — check by hand.");
  line();
  const byKey = new Map(all.map((e) => [e.key, e]));
  for (const conf of ["high", "medium", "low"] as const) {
    const list = suggestions.filter((s) => s.confidence === conf);
    if (!list.length) continue;
    line(`### ${conf[0].toUpperCase() + conf.slice(1)} (${list.length})`);
    line();
    list.sort((a, b) => a.from.localeCompare(b.from))
      .forEach((s) => line(`- ${byKey.get(s.from)!.name} ↔ ${byKey.get(s.to)!.name} — ${s.reason} (\`${s.from}\` ↔ \`${s.to}\`)`));
    line();
  }

  fs.writeFileSync(path.join(OUT_DIR, "content-audit.md"), md.join("\n"));

  console.log(`Audited ${all.length} records across ${kinds.length} sections.`);
  console.log(`No source: ${noSource.length} · No image: ${noImage.length} · Short text: ${thin.length} · Russian spellings: ${spellings.length} · Link suggestions: ${suggestions.length}`);
  if (links) console.log(`Links: ${links.size} checked · ${badLinks.length} broken/failing · ${blockedLinks} blocked`);
  console.log(`Report: ${path.join(OUT_DIR, "content-audit.md")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
