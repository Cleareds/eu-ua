-- Reference data → database, so it can be managed in the CMS later.
--
-- Run this once in the Supabase SQL editor. It is idempotent: safe to re-run, and
-- it never deletes rows. After it succeeds, run `npx tsx scripts/sync-reference-data.ts`
-- to load data/*.json into these tables.
--
-- Why this file exists: the tables below were seeded once in March 2026 and then
-- diverged from data/*.json, and some of them could not hold the JSON at all —
-- `cities` had no `status`/`image`, `eu_chapters` had no `cluster`. Widening the
-- schema first is what makes DB-backed reads safe.

-- ─── 1. Widen existing tables ────────────────────────────────────────────────

-- eu_chapters: cluster grouping drives the "Ch. 1 · C2" badges on /eu-accession.
alter table public.eu_chapters add column if not exists cluster      integer;
alter table public.eu_chapters add column if not exists cluster_name text;
alter table public.eu_chapters add column if not exists updated_at   timestamptz default now();

-- cities: `status` is what colours the map (free / occupied / liberated). Without
-- it every city renders as if it were unoccupied.
alter table public.cities add column if not exists status     text;
alter table public.cities add column if not exists image      text;
alter table public.cities add column if not exists updated_at timestamptz default now();

-- quiz_questions: four separate question sets (general, people, places, heritage),
-- each with its own id sequence starting at 1 — so the primary key has to include
-- the category, otherwise the sets collide on insert.
alter table public.quiz_questions add column if not exists category   text not null default 'general';
alter table public.quiz_questions add column if not exists updated_at timestamptz default now();

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.quiz_questions'::regclass
      and contype = 'p'
      and array_length(conkey, 1) = 1
  ) then
    alter table public.quiz_questions drop constraint quiz_questions_pkey;
    alter table public.quiz_questions add primary key (category, id);
  end if;
end $$;

-- ─── 2. Tables that did not exist ────────────────────────────────────────────

-- Historical timeline (58 events). Ids are slugs, not integers.
create table if not exists public.timeline_events (
  id                  text primary key,
  year                text not null,          -- display form, e.g. "14 July 2026"
  year_sort           integer not null,       -- sort key
  title               text not null,
  description         text not null,
  era                 text not null,          -- ancient | medieval | early-modern | national-awakening | independence | eu-path
  type                text not null,          -- cultural | political | diplomatic | military
  european_connection boolean not null default false,
  source_label        text,
  source_url          text,
  updated_at          timestamptz default now()
);

-- Cultural heritage sites, including war-damage status.
create table if not exists public.cultural_sites (
  id          text primary key,
  name        text not null,
  city        text,
  lat         double precision,
  lng         double precision,
  type        text,
  description text,
  damage      text,
  date        text,
  sources     jsonb not null default '[]'::jsonb,
  image       text,
  updated_at  timestamptz default now()
);

-- Ukrainian heritage abroad (diaspora), shown as a separate map layer.
create table if not exists public.diaspora_heritage (
  id                   text primary key,
  name                 text not null,
  city                 text,
  country              text,
  lat                  double precision,
  lng                  double precision,
  category             text,
  ukrainian_connection text,
  description          text,
  sources              jsonb not null default '[]'::jsonb,
  image                text,
  updated_at           timestamptz default now()
);

-- ─── 3. Public read access ───────────────────────────────────────────────────
-- These are published reference datasets: anyone may read them, and only the
-- service role (admin API / sync script) may write. This matches how the existing
-- eu_chapters / cities / myths tables already behave.

alter table public.timeline_events   enable row level security;
alter table public.cultural_sites    enable row level security;
alter table public.diaspora_heritage enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'timeline_events' and policyname = 'public read') then
    create policy "public read" on public.timeline_events for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'cultural_sites' and policyname = 'public read') then
    create policy "public read" on public.cultural_sites for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'diaspora_heritage' and policyname = 'public read') then
    create policy "public read" on public.diaspora_heritage for select using (true);
  end if;
end $$;
