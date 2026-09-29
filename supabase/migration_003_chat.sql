-- Linkup Sports — migration 003: chat (friend DMs + session group chat)
--
-- Run this ONCE in your Supabase project's SQL editor (Project -> SQL
-- Editor -> New query -> paste -> Run) AFTER pulling the app-code update
-- that adds the Chat tab. It only adds a new table — nothing existing is
-- touched, so it's safe to run against a live project with real data in it.

create table if not exists messages (
  id text primary key,
  scope text not null check (scope in ('dm', 'session')),
  scope_id text not null,
  sender_id text not null,
  sender_name text not null,
  sender_initials text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_scope_idx on messages (scope, scope_id, created_at);

alter table messages enable row level security;

drop policy if exists "public read" on messages;
drop policy if exists "public insert" on messages;

create policy "public read" on messages for select using (true);
create policy "public insert" on messages for insert with check (true);

-- Turn on Realtime for this table too — without this, messages will save
-- but won't show up live for the other person until they reopen the chat.
alter publication supabase_realtime add table messages;
