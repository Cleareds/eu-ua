-- EU-UA.com Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- ─────────────────────────────────────────
-- EU Accession Chapters
-- ─────────────────────────────────────────
create table if not exists eu_chapters (
  id integer primary key,
  name text not null,
  status text not null check (status in ('not_started', 'screening', 'negotiation', 'completed')),
  description text not null,
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- Cultural Cities
-- ─────────────────────────────────────────
create table if not exists cities (
  id text primary key,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  description text not null,
  connections jsonb not null default '[]',
  notable_figures jsonb not null default '[]',
  european_influences jsonb not null default '[]'
);

-- ─────────────────────────────────────────
-- Data Dashboard Points
-- ─────────────────────────────────────────
create table if not exists data_points (
  id serial primary key,
  category text not null check (category in ('tradeShare', 'students', 'assistance', 'tradeGrowth')),
  year integer not null,
  value double precision not null,
  unique (category, year)
);

-- ─────────────────────────────────────────
-- Myths
-- ─────────────────────────────────────────
create table if not exists myths (
  id integer primary key,
  myth text not null,
  reality text not null
);

create table if not exists myth_sources (
  id serial primary key,
  myth_id integer references myths(id) on delete cascade,
  title text not null,
  url text not null
);

-- ─────────────────────────────────────────
-- Quiz Questions
-- ─────────────────────────────────────────
create table if not exists quiz_questions (
  id integer primary key,
  question text not null,
  options jsonb not null,
  correct integer not null,
  explanation text not null
);

-- ─────────────────────────────────────────
-- News Timeline
-- ─────────────────────────────────────────
create table if not exists news_timeline (
  id serial primary key,
  date date not null,
  headline text not null,
  summary text not null,
  source text not null,
  url text not null unique,
  created_at timestamptz default now()
);

-- Index for fast date-ordered news fetches
create index if not exists news_timeline_date_idx on news_timeline(date desc);

-- ─────────────────────────────────────────
-- Row Level Security (public read, no public write)
-- ─────────────────────────────────────────
alter table eu_chapters enable row level security;
alter table cities enable row level security;
alter table data_points enable row level security;
alter table myths enable row level security;
alter table myth_sources enable row level security;
alter table quiz_questions enable row level security;
alter table news_timeline enable row level security;

-- Allow anyone to read all tables (public educational data)
create policy "Public read eu_chapters" on eu_chapters for select using (true);
create policy "Public read cities" on cities for select using (true);
create policy "Public read data_points" on data_points for select using (true);
create policy "Public read myths" on myths for select using (true);
create policy "Public read myth_sources" on myth_sources for select using (true);
create policy "Public read quiz_questions" on quiz_questions for select using (true);
create policy "Public read news_timeline" on news_timeline for select using (true);
