# Linkup Sports

Bringing back third spaces in Jamaica — find and host open play sessions across
independent courts, pitches, and clubs, for any sport, and cultivate new
connections through the game. Built to start as small as one friend group
splitting a weekly pickleball court, and to scale up to a proof-of-concept you
can bring to venues.

## What's built

- **Unified open-play feed** — every public session in one list, filterable
  by sport and parish, sorted by soonest start time.
- **Chat** — a dedicated tab for talking to people, in two places: DM any
  friend directly, and a group chat for everyone in an open play session
  once you've joined it (or you're hosting). From inside a game's chat you
  can add anyone there as a friend with one tap — no code exchange needed,
  since you're both already looking at the same session. A red dot shows
  up on the Chat tab (and on the specific conversation in the Chat list)
  whenever someone sends you a new message you haven't opened yet, and
  clears the moment you open that thread.
- **Private, invite-only sessions** — perfect for a standing weekly game.
  Toggle a session to Private when creating it and you get a 6-character
  invite code to text your crew; they join from Discover → "Have a code?"
  without ever seeing it in the public feed.
- **Free or paid sessions, either way** — check "This session is free" on any
  public or private session. Free sessions show `FREE` everywhere cost would
  normally appear.
- **Cost splitting for private sessions** — the organizer sets one total cost
  (e.g. the court rental) and it's divided evenly across whoever has joined
  so far, live — no manual math.
- **Organizer payment info** — when a session isn't free, the host says how
  they want to get paid: Cash, an account number/handle, or both, plus an
  optional note ("send before Friday"). It shows on the session page to
  everyone who joins.
- **Friends, with a real request/accept step, and in-app notifications** —
  add friends by sharing a 6-character friend code (Profile → Friends), or
  with one tap from inside a shared game's chat. In live mode that sends a
  request, not an instant add: the other person sees it under "Requests" on
  their Friends page and in Notifications, with Accept/Decline buttons, and
  you're only friends once they accept. (Demo mode has no second device to
  notify, so adding there stays instant, same as before — see "Local
  identity" below.) When a friend posts a public open game you'll see a live
  banner if the app is open, plus a badge on the bell icon and an entry in
  Notifications the next time you open it. See "How notifications actually
  work" below for what this does and doesn't cover.
- **No login required** — each device gets a lightweight local identity (a
  name you pick, stored on your phone/browser) instead of email/password
  accounts, so friends can start using it in seconds.
- **Type-your-own venue, with favorites** — until there are official venue
  partnerships, hosting a session means typing the venue name and picking a
  parish (no fixed list to be limited by). Type a venue once and it's
  offered as a one-tap "favorite" chip next time, so regulars don't retype
  "the usual spot" every week. See "Where venues are headed" below for how
  this becomes a real selectable directory later.
- **Generic multi-sport data model** (`src/types.ts`) — adding a new sport
  is a pure data change: `Sport`, `OpenPlaySession`. The old fixed-venue
  types (`Business`, `Venue`, `Facility`) are still defined and seeded in
  `src/data/mockData.ts`, unused for now — kept on purpose as the starting
  point for a real venue directory once that's worth building.
- **"Game Mode Activated" dark theme** — near-black surfaces, neon lime/cyan
  accents, glow effects.
- Installable as a **PWA** on phones (manifest + icons included).

## Start to finish: getting this live and shared with your friends

This is the full path from what you have right now (code on your computer)
to friends joining games and getting notified from their own phones.

### Step 1 — Try it locally first (2 minutes, optional but recommended)

```bash
npm install
npm run dev
```

Open the local URL it prints. This runs in **demo mode** — no account, no
setup — and the friends/notifications feature is pre-seeded with two demo
friends so you can see it working immediately (open Profile → Friends, and
you'll already have an unread notification badge). Nothing here is shared
with anyone yet; it's just local to your browser. Good for sanity-checking
before you wire up the real backend.

### Step 2 — Create a Supabase project (the real, shared database)

1. Go to [supabase.com](https://supabase.com), sign up (the free tier is
   enough for a friend group), and create a new project.
2. Open the **SQL Editor**, paste in the full contents of
   `supabase/schema.sql` from this repo, and run it. This creates four
   tables: `sessions`, `profiles` (so friends can be looked up by code),
   `friendships` (request + accept), and `messages` (chat) — with permissive
   row-level security appropriate for a small trusted group testing
   together (see the security note inside that file for what that
   trade-off means).
3. Turn on Realtime for the sessions table so joins and new games show up
   live: **Database → Replication → supabase_realtime**, toggle on
   `sessions`.
4. Go to **Project Settings → API** and copy the **Project URL** and the
   **anon public** key — you'll need both in the next step.

### Step 3 — Point the app at your Supabase project

Copy `.env.example` to `.env` and fill in the two values:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run `npm run dev` again. The Profile tab should now say **Live** instead of
**Demo mode**. Create a test session and check the Supabase **Table
Editor** — you should see it land in the `sessions` table immediately.

### Step 4 — Deploy so friends can use it from their own phones

The easiest path is [Vercel](https://vercel.com) (free tier):

1. This workspace has no git history yet, so first: `git init`, commit
   everything, and push it to a new GitHub repo.
2. In Vercel, "Add New Project" → import that repo. It auto-detects Vite;
   the defaults are correct (`npm run build`, output directory `dist`).
3. Add the same two environment variables (`VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings, then deploy.
4. You'll get a `*.vercel.app` URL — that's the link you send your group.

### Step 5 — Get your friends set up

Send everyone the deployed URL. Each person, on their own phone:

1. Opens the link and picks a display name once (no email, no password).
2. Optionally "installs" it as an app — most phone browsers offer "Add to
   Home Screen," which makes it open full-screen like a native app.
3. Goes to **Profile → Friends** and shares their friend code with you
   (text it, or just read it out) — you each add one another the same way
   you'd exchange usernames. This only takes a few seconds and only needs
   to happen once per pair of friends.

### Step 6 — Post and join games

Whoever's organizing the weekly pickleball or football game creates a
session (public if anyone in your area should see it, private with an
invite code if it's just for your specific group), sets the cost — free,
per-person, or a total to split — and how they want to get paid. Everyone
who's added them as a friend gets notified. Everyone else can find it in
the Discover feed if it's public, or join with the invite code if it's
private.

## How future updates roll out (and why your data is always safe)

Once this is deployed, any future change (new feature, bug fix, tweak) goes
out like this:

1. New code gets pushed to your GitHub repo.
2. Vercel notices the push and automatically rebuilds and redeploys — this
   is standard Vercel behavior, nothing extra to configure once step 4 of
   the deploy guide above is done.
3. Everyone's copy of the app updates itself. Concretely: every build
   stamps a small `version.json` file with a fresh build id
   (`scripts/write-version.mjs`, wired into `npm run build`). The app
   checks that file whenever someone switches back to the tab or reopens
   it (`src/components/UpdateWatcher.tsx`) — not on a timer while they're
   actively using it, so it never interrupts someone mid-action. The
   moment it sees a new build id, it shows a one-line "updating…" banner
   and reloads itself about a second later. Nobody has to reinstall,
   clear their cache, or do anything.

**Your data is never touched by any of this.** The app's code (what you
push to GitHub/Vercel) and your data (sessions, friends, profiles, all in
Supabase) are two completely separate systems. Redeploying the app only
replaces the static files Vercel serves — it has no way to reach into
Supabase, so nobody's games, joined sessions, or friend list are ever at
risk from a code update. The only thing that *would* change stored data is
someone deliberately running new SQL against your Supabase project (for
example, if a future feature needs a new column) — that's a separate,
explicit step you'd always be told about and run yourself in the Supabase
SQL Editor, and it would be written to add to what's there, never to wipe
it.

## Shipping this specific update (freeform venues)

This update changes what a session stores (venue name + parish instead of
a picked venue/facility id), so unlike a typical code-only change, it needs
one extra one-time step against your live database before the new code
will work correctly. Steps, in order:

1. **Run the migration.** Open your Supabase project → SQL Editor → New
   query, paste in the full contents of
   `supabase/migration_002_freeform_venues.sql`, and run it. This adds the
   new `venue_name`/`parish`/`facility_name` columns and drops the old
   `venue_id`/`facility_id` ones. It's safe to run even with existing
   sessions in the table — nothing gets deleted.
2. **Get the new code into your local project folder.** Download the
   updated source zip, unzip it, and replace your project folder's
   contents with it (or copy over the changed files if you're tracking
   which ones changed — see the file list in this README's "Structure"
   section).
3. **Commit and push**, from inside your project folder:
   ```bash
   git add -A
   git commit -m "Freeform venues + favorites"
   git push
   ```
4. **Vercel redeploys automatically** — no dashboard steps needed, since
   this is a code change, not an environment variable change. Watch the
   Deployments tab if you want to see it happen.
5. **Confirm it worked**: open the live site, go to Start Open Play — you
   should see a text field for venue name and a Parish dropdown instead of
   a list of courts. Everyone else's already-open tabs will pick up the
   new version automatically within a few minutes (or the moment they
   switch back to the tab), per the auto-update mechanism described above.

If you skip step 1 and push the code first, posting a new session will
fail (the database won't have the columns the app is trying to write to)
— so migration first, code push second.

## Shipping this specific update (friend requests, unread chat dot, nav fix)

This update changes how adding a friend works (a request + accept step
instead of an instant add), adds a small red unread dot to the Chat tab,
and fixes the `+` button in the bottom bar so it sits inline instead of
floating over the chat message box. The friend-request part touches the
database, so it needs a migration first, same order as previous updates:

1. **Run the migration.** Supabase project → SQL Editor → New query, paste
   in the full contents of `supabase/migration_004_friend_requests.sql`,
   and run it. This adds a `status` column to the `friendships` table
   (defaulting existing rows to `accepted`, so nobody who's already friends
   is affected) and a policy allowing that column to be updated (needed for
   Accept). Nothing existing is deleted.
2. **Get the new code in and push it** — unzip into your project folder
   without disturbing `.git` (see Step 2 of "How future updates roll out"
   above if you need the exact commands), then `git add -A`, `git commit`,
   `git push`.
3. **Confirm it worked**: on the live site, add a friend by code from a
   second account/device — it should say "Request sent" instead of adding
   them immediately, and the other person should see it under Friends →
   Requests and in Notifications with Accept/Decline buttons. Send a chat
   message from one account and check the other sees a small red dot on
   the Chat tab until they open that thread. Open the app on a phone and
   confirm the `+` button in the bottom bar sits level with the other icons
   instead of floating above them.

## Shipping this specific update (chat)

This update adds a new `messages` table, so it needs the same
migration-first-then-code order as above:

1. **Run the migration.** Supabase project → SQL Editor → New query, paste
   in the full contents of `supabase/migration_003_chat.sql`, and run it.
   This creates the `messages` table and turns on Realtime for it — without
   that last part, messages will save but won't show up live for the other
   person until they reopen the chat.
2. **Get the new code in and push it**, same as any other update — see the
   steps above (unzip into your project folder without disturbing `.git`,
   then `git add -A`, `git commit`, `git push`).
3. **Confirm it worked**: open the live site, you should see a new Chat
   icon in the bottom bar between Discover and My Games. Open a friend's
   chat or a game you're in and send a message — it should appear
   immediately on your end, and on a friend's device within a second or
   two if they have that same thread open.

## How notifications actually work

Right now this is **in-app only** — there's no push notification that
lands on someone's lock screen the way a text message would. Concretely:

- **App open:** a friend posts a public game → a banner pops up for anyone
  who has them as a friend, live, via the same real-time database
  connection sessions already use. No refresh needed.
- **App closed, opened later:** the bell icon on the Discover tab shows a
  badge with how many new friend-posted games you missed; tapping it opens
  a full list.
- **App fully closed and not reopened:** nothing happens. This is the gap
  compared to a real push notification (the kind that shows up even when
  the app isn't open) — closing that gap needs a service worker, browser
  push subscriptions, security keys (VAPID), and a small server function to
  trigger the push, which is a meaningfully bigger lift than what's here.
  Worth adding once you know people are actually opening the app regularly
  enough that it's the main thing standing between them and showing up to
  games.

## Local identity — what it is and isn't

There's no email/password/account system. The first time the app opens on a
device, it generates a random ID and asks for a display name, both stored
in that browser's local storage (`src/context/IdentityContext.tsx`). That ID
is what marks someone as the host of a session, a member of "who's in," or
a friend.

This is a deliberate simplification to remove friction for a small trusted
group testing the app together. The tradeoffs to know about:

- Clearing browser data / reinstalling loses that identity (a "new" person
  shows up; past sessions they joined won't show them as joined anymore,
  and their friends will need to re-add them).
- There's no real access control — the Supabase policies in
  `supabase/schema.sql` let anyone with the anon key read and write any
  row. Fine behind a private link with people you trust; not something to
  expose publicly as-is.
- Friend adds require acceptance in live mode — entering someone's code (or
  one-tapping them from a shared game's chat) sends a request; you're
  friends once they hit Accept on their Friends page or Notifications. In
  demo mode, with no second device around to notify, adding still connects
  you both instantly — that's a deliberate demo-only shortcut, not a bug.
- Upgrading to real accounts later (Supabase Auth with magic links, for
  example) is a contained change — mostly `IdentityContext.tsx` and the RLS
  policies — and won't require touching the UI much.

## Where venues are headed

Right now, posting a session means typing a venue name and picking a
parish — there's no fixed list, because there's no official venue
partnership yet to make one accurate. Two things are kept in the codebase,
unused, specifically so that flipping this back on later is a small change
rather than a rebuild:

- `Venue`, `Facility`, and `Business` types in `src/types.ts`.
- The seeded `VENUES` and `BUSINESSES` arrays (with real facility lists,
  ratings, price ranges, amenities) in `src/data/mockData.ts`, plus the
  `getVenue`/`getBusiness` lookup helpers.

Once a venue signs on officially, reintroducing a "select from official
venues" picker in `CreateSession.tsx` — alongside, or instead of, the
freeform text field — is the natural next step, and the favorites people
have already built up carry over without any migration.

## Where this is headed

Once there's real usage from a group actually playing weekly, the next
step is a venue-facing proposal: usage data plus this working
proof-of-concept, to pitch venue owners on listing officially (there's
already an "Apply as a venue partner" stub on the Profile screen for that
flow). Everything in this MVP — the private sessions, the payment note, the
cost split, friends and notifications — is built to double as evidence for
that pitch: it shows real organizers coordinating real games, real
payments changing hands, and real people showing up because a friend
invited them, which is the usability story a venue owner would want to see.

## Running it locally

```bash
npm install
npm run dev       # local dev server (demo mode unless .env is set)
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Structure

```
src/
  types.ts                   domain model (sessions, payments, friends, favorites, chat)
  data/mockData.ts           seed data — sports, sessions, parishes, plus
                              unused venue/business seed data kept for later
                              (see "Where venues are headed" above)
  lib/geo.ts                 date formatting helpers (distanceKm/formatDistance
                              unused for now, kept for the same reason)
  lib/cost.ts                 cost-per-person / free / display helpers
  lib/codes.ts                shared short-code generator (invites + friend codes)
  lib/chat.ts                 dmThreadId — stable conversation key for two people
  lib/supabaseClient.ts      Supabase client + isSupabaseConfigured flag
  context/                   Identity, Sessions, Friends, Notifications, Favorites, Chat
                              (LocationContext.tsx is unused, kept for the same reason)
  components/                 SplashScreen, NameGate, FriendGameToast, UpdateWatcher,
                              BottomNav, SportChip, SessionCard, PageHeader
  pages/                      Feed, SessionDetail, CreateSession, JoinByCode, Friends,
                              Notifications, MyGames, Profile, Chat, ChatThread
scripts/write-version.mjs    stamps public/version.json on every build (see above)
supabase/schema.sql           run once in the Supabase SQL editor for a fresh project
supabase/migration_002_freeform_venues.sql
                              run once against an ALREADY-LIVE project to pick up
                              the freeform-venue change (see below)
supabase/migration_003_chat.sql
                              run once against an ALREADY-LIVE project to add chat
supabase/migration_004_friend_requests.sql
                              run once against an ALREADY-LIVE project to add
                              friend request/accept
.env.example                  copy to .env for live mode
```
