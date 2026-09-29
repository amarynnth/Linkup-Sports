-- Linkup Sports — migration 004: friend requests (require acceptance)
--
-- Run this ONCE in your Supabase project's SQL editor (Project -> SQL
-- Editor -> New query -> paste -> Run) AFTER pulling the app-code update
-- that adds Accept/Decline to Friends. It only adds a column and a policy —
-- nothing existing is deleted, so it's safe to run against a live project
-- with real data in it. Every existing friendship row gets status
-- 'accepted' automatically (that's the column's default), so nobody who
-- already added each other is affected.

alter table friendships add column if not exists status text not null default 'accepted';

alter table friendships drop constraint if exists friendships_status_check;
alter table friendships add constraint friendships_status_check check (status in ('pending', 'accepted'));

create index if not exists friendships_friend_id_idx on friendships (friend_id);

drop policy if exists "public update" on friendships;
create policy "public update" on friendships for update using (true);
