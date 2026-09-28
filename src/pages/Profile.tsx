import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Check, Users, ChevronRight } from 'lucide-react';
import { getSport, CURRENT_USER } from '../data/mockData';
import { useSessions } from '../context/SessionsContext';
import { useIdentity } from '../context/IdentityContext';
import { useFriends } from '../context/FriendsContext';

export default function Profile() {
  const { hostedSessionIds, joinedSessionIds, isLive } = useSessions();
  const { name, initials, setName } = useIdentity();
  const { friends } = useFriends();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const saveName = () => {
    if (draft.trim().length >= 2) setName(draft);
    setEditing(false);
  };

  return (
    <div className="pb-24">
      <header className="flex items-center justify-between px-5 pb-2 pt-8">
        <h1 className="font-display text-xl font-bold text-ink">Profile</h1>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            isLive ? 'bg-lime/15 text-lime' : 'bg-surface-3 text-ink-faint'
          }`}
        >
          {isLive ? 'Live' : 'Demo mode'}
        </span>
      </header>

      <main className="mt-4 flex flex-col gap-5 px-5">
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime to-cyan text-lg font-black text-void">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  className="min-w-0 flex-1 rounded-lg border border-line bg-void px-2.5 py-1.5 text-sm font-bold text-ink focus:border-lime focus:outline-none"
                />
                <button onClick={saveName} className="shrink-0 text-lime">
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <button onClick={() => { setDraft(name); setEditing(true); }} className="flex items-center gap-1.5">
                <p className="truncate text-base font-bold text-ink">{name || 'Set your name'}</p>
                <Pencil size={12} className="shrink-0 text-ink-faint" />
              </button>
            )}
            <p className="text-xs text-ink-faint">New Kingston, Jamaica</p>
          </div>
        </div>

        {!isLive && (
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-bold text-ink">You're in demo mode</p>
            <p className="mt-1 text-xs text-ink-dim">
              Sessions you create or join right now only live on this device. Connect a Supabase backend
              (see the README) to make games real-time and shared with your friends.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Sessions joined" value={joinedSessionIds.length} />
          <Stat label="Sessions hosted" value={hostedSessionIds.length} />
        </div>

        <Link
          to="/friends"
          className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/15 text-cyan">
              <Users size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">Friends</p>
              <p className="text-xs text-ink-faint">
                {friends.length} added · get notified when they post a game
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-ink-faint" />
        </Link>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-faint">Favorite sports</p>
          <div className="flex flex-wrap gap-2">
            {CURRENT_USER.favoriteSportIds.map((id) => {
              const sport = getSport(id);
              return (
                <span
                  key={id}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
                  style={{ backgroundColor: `${sport.color}22`, color: sport.color }}
                >
                  {sport.emoji} {sport.name}
                </span>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-sm font-bold text-ink">Own a court, pitch, or club?</p>
          <p className="mt-1 text-xs text-ink-dim">
            List your venue on Linkup Sports so players can find your open slots by proximity — no
            matter how small or independent your business is.
          </p>
          <button className="mt-3 rounded-lg bg-ink px-3.5 py-2 text-xs font-bold text-void">
            Apply as a venue partner
          </button>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="font-display text-2xl font-black text-lime">{value}</p>
      <p className="mt-0.5 text-xs text-ink-faint">{label}</p>
    </div>
  );
}
