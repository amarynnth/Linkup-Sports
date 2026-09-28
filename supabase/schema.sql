-- Linkup Sports — Supabase schema
--
-- Run this once in your Supabase project's SQL editor (Project ->
-- SQL Editor -> New query -> paste -> Run). It creates a single
-- `sessions` table that mirrors src/types.ts's OpenPlaySession, using
-- a JSONB `joined` column instead of a separate participants table —
-- simple and plenty fast at friend-group scale.
--
-- After running this, also turn on Realtime for the table so joins
-- and new sessions show up live for everyone:
--   Database -> Replication -> supabase_realtime -> toggle on `sessions`
-- or run:
--   alter publication supabase_realtime add table sessions;

create table if not exists sessions (
  id text primary key,
  venue_name text not null,
  parish text not null,
  facility_name text,
  sport_id text not null,
  host_id text not null,
  host_name text not null,
  starts_at timestamptz not null,
  duration_mins integer not null,
  capacity integer not null,
  skill_level text not null default 'Open',
  is_private boolean not null default false,
  invite_code text unique,
  cost_per_person_jmd integer,
  total_cost_jmd integer,
  payment_type text,
  payment_account_info text,
  payment_note text,
  notes text,
  status text not null default 'open',
  joined jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sessions_invite_code_idx on sessions (invite_code);
create index if not exists sessions_starts_at_idx on sessions (starts_at);

alter table sessions enable row level security;

-- MVP policy: this app has no real login yet (see IdentityContext), so
-- everyone using the anon key can read and write every row. That's fine
-- for testing with a small trusted friend group behind a shared invite
-- link, but it is NOT locked down — anyone with your anon key could, in
-- principle, edit any session. Before a wider or public launch, add real
-- Supabase Auth and rewrite these policies to check auth.uid() against
-- host_id / a participants table.
drop policy if exists "public read" on sessions;
drop policy if exists "public insert" on sessions;
drop policy if exists "public update" on sessions;

create policy "public read" on sessions for select using (true);
create policy "public insert" on sessions for insert with check (true);
create policy "public update" on sessions for update using (true);


-- Profiles — one row per device/player, so friends can look each other up
-- by a short shareable code. Written by IdentityContext whenever someone
-- sets or changes their display name in live mode.
create table if not exists profiles (
  id text primary key,
  name text not null,
  initials text not null,
  friend_code text unique not null,
  updated_at timestamptz not null default now()
);

create index if not exists profiles_friend_code_idx on profiles (friend_code);

alter table profiles enable row level security;

drop policy if exists "public read" on profiles;
drop policy if exists "public insert" on profiles;
drop policy if exists "public update" on profiles;

create policy "public read" on profiles for select using (true);
create policy "public insert" on profiles for insert with check (true);
create policy "public update" on profiles for update using (true);


-- Friendships — instant mutual "add" (no request/accept step, to keep this
-- frictionless for a small trusted group). Adding a friend writes both
-- directions at once from the app.
create table if not exists friendships (
  id text primary key,
  user_id text not null references profiles(id) on delete cascade,
  friend_id text not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, friend_id)
);

create index if not exists friendships_user_id_idx on friendships (user_id);

alter table friendships enable row level security;

drop policy if exists "public read" on friendships;
drop policy if exists "public insert" on friendships;
drop policy if exists "public delete" on friendships;

create policy "public read" on friendships for select using (true);
create policy "public insert" on friendships for insert with check (true);
create policy "public delete" on friendships for delete using (true);
