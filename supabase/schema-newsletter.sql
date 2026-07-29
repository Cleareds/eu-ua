-- Newsletter subscribers.
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Everything in app/api/newsletter/* works as soon as this table exists.
--
-- RLS is enabled with NO policies, which is deliberate: the anon key used by the
-- browser gets no access at all, so the subscriber list can never be read from
-- the client. Every read/write goes through the service role in the API routes.

create table if not exists public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),

  -- Stored lower-cased and trimmed by the application layer.
  email           text not null unique,

  -- 'pending' exists for a future double opt-in flow: it needs an email provider
  -- to send the confirmation link, which the project does not have yet, so today
  -- the API writes 'confirmed' directly off an explicit consent checkbox.
  status          text not null default 'confirmed'
                    check (status in ('pending', 'confirmed', 'unsubscribed')),

  -- Used for one-click unsubscribe links (and later, confirmation links).
  token           uuid not null default gen_random_uuid(),

  -- Which form the signup came from ('footer', 'news', …) — useful for knowing
  -- what actually converts.
  source          text,

  -- The exact consent wording shown at signup. GDPR requires being able to
  -- demonstrate what the person agreed to, not just that they agreed.
  consent_text    text not null,

  created_at      timestamptz not null default now(),
  confirmed_at    timestamptz,
  unsubscribed_at timestamptz
);

create unique index if not exists newsletter_subscribers_token_idx
  on public.newsletter_subscribers (token);

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status);

alter table public.newsletter_subscribers enable row level security;
