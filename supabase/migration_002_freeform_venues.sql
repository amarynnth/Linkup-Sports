-- Linkup Sports — migration 002: freeform venues
--
-- Run this ONCE in your Supabase project's SQL editor (Project -> SQL
-- Editor -> New query -> paste -> Run) AFTER you've pulled the app-code
-- update that removes the fixed venue/facility picker in favor of a
-- freeform venue name + parish (+ optional facility name).
--
-- What this does: the `sessions` table used to store `venue_id` and
-- `facility_id`, which pointed into a fixed list of mock venues baked into
-- the app. Sessions now store the venue name and parish directly, typed in
-- by whoever's hosting, since there's no official venue directory yet.
--
-- This is safe to run against a live project — it does not delete any
-- session rows, only the two now-unused columns, and adds the three new
-- ones with a temporary default so the NOT NULL constraint doesn't choke
-- on any existing rows (then drops that default so the app's own values
-- are required going forward, same as the original columns).

alter table sessions add column if not exists venue_name text;
alter table sessions add column if not exists parish text;
alter table sessions add column if not exists facility_name text;

update sessions set venue_name = coalesce(venue_name, 'Unknown venue') where venue_name is null;
update sessions set parish = coalesce(parish, 'Kingston') where parish is null;

alter table sessions alter column venue_name set not null;
alter table sessions alter column parish set not null;

alter table sessions drop column if exists venue_id;
alter table sessions drop column if exists facility_id;
