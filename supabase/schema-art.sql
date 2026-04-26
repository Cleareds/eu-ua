-- ─────────────────────────────────────────
-- Ukrainian Art — Schema Extension
-- Safe to run multiple times (fully idempotent).
-- Run in Supabase SQL Editor (NOT schema.sql — that is the base schema).
-- ─────────────────────────────────────────

-- Art Movements / Waves
create table if not exists art_waves (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_uk text,
  period text,
  start_year integer,
  end_year integer,
  description text not null default '',
  full_description text,
  cover_image_url text,
  tags text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Artists
create table if not exists art_artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_uk text,
  born integer,
  died integer,
  birth_place text,
  short_bio text not null default '',
  full_bio text,
  profile_image_url text,
  tags text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Artist ↔ Wave junction (many-to-many)
create table if not exists art_artist_waves (
  artist_id uuid references art_artists(id) on delete cascade,
  wave_id uuid references art_waves(id) on delete cascade,
  primary key (artist_id, wave_id)
);

-- Art Objects (individual artworks)
create table if not exists art_objects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  title_uk text,
  artist_id uuid references art_artists(id) on delete set null,
  wave_id uuid references art_waves(id) on delete set null,
  year integer,
  medium text,
  dimensions text,
  location text,
  short_description text not null default '',
  full_description text,
  image_url text,
  tags text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists art_objects_artist_idx on art_objects(artist_id);
create index if not exists art_objects_wave_idx on art_objects(wave_id);
create index if not exists art_objects_featured_idx on art_objects(featured) where published = true;
create index if not exists art_artists_featured_idx on art_artists(featured) where published = true;
create index if not exists art_waves_start_year_idx on art_waves(start_year);

-- Updated_at trigger function (create or replace = idempotent)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers (drop first so re-running is safe)
drop trigger if exists art_waves_updated_at on art_waves;
create trigger art_waves_updated_at
  before update on art_waves
  for each row execute function set_updated_at();

drop trigger if exists art_artists_updated_at on art_artists;
create trigger art_artists_updated_at
  before update on art_artists
  for each row execute function set_updated_at();

drop trigger if exists art_objects_updated_at on art_objects;
create trigger art_objects_updated_at
  before update on art_objects
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
alter table art_waves enable row level security;
alter table art_artists enable row level security;
alter table art_artist_waves enable row level security;
alter table art_objects enable row level security;

-- Drop existing policies before (re)creating — makes this script idempotent
drop policy if exists "Public read art_waves"       on art_waves;
drop policy if exists "Public read art_artists"     on art_artists;
drop policy if exists "Public read art_artist_waves" on art_artist_waves;
drop policy if exists "Public read art_objects"     on art_objects;

-- Public: read published content only
create policy "Public read art_waves"
  on art_waves for select using (published = true);

create policy "Public read art_artists"
  on art_artists for select using (published = true);

create policy "Public read art_artist_waves"
  on art_artist_waves for select using (true);

create policy "Public read art_objects"
  on art_objects for select using (published = true);

-- Admin writes bypass RLS via service_role key (SUPABASE_SERVICE_ROLE_KEY env var).
-- No write policies needed — service_role skips RLS entirely.
