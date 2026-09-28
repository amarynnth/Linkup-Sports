import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, KeyRound, Bell } from 'lucide-react';
import { SPORTS, PARISHES } from '../data/mockData';
import { useSessions } from '../context/SessionsContext';
import { useNotifications } from '../context/NotificationsContext';
import SportChip from '../components/SportChip';
import SessionCard from '../components/SessionCard';

const ALL_FILTER = { id: 'all' as const, name: 'All Sports', emoji: '🎮', color: '#c6ff3d' };
const ALL_PARISHES = 'All parishes';

export default function Feed() {
  const { sessions } = useSessions();
  const { unseenCount } = useNotifications();
  const [activeSport, setActiveSport] = useState<string>('all');
  const [parishFilter, setParishFilter] = useState<string>(ALL_PARISHES);
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    return sessions
      .filter((s) => s.status !== 'cancelled')
      .filter((s) => !s.isPrivate)
      .filter((s) => (activeSport === 'all' ? true : s.sportId === activeSport))
      .filter((s) => (parishFilter === ALL_PARISHES ? true : s.parish === parishFilter))
      .filter((s) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return s.venueName.toLowerCase().includes(q) || s.parish.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [sessions, activeSport, parishFilter, query]);

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-20 bg-void/95 px-5 pb-3 pt-6 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Open play</p>
            <p className="text-sm font-bold text-ink">Discover</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/notifications"
              className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-ink-dim"
            >
              <Bell size={16} />
              {unseenCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-ink">
                  {unseenCount > 9 ? '9+' : unseenCount}
                </span>
              )}
            </Link>
            <span className="font-display rounded-lg bg-surface px-2.5 py-1.5 text-xs font-bold text-lime">
              {rows.length} LIVE
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5">
          <Search size={16} className="text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search venue or parish…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>

        <div className="mt-3 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          <SportChip sport={ALL_FILTER} active={activeSport === 'all'} onClick={() => setActiveSport('all')} />
          {SPORTS.map((sport) => (
            <SportChip
              key={sport.id}
              sport={sport}
              active={activeSport === sport.id}
              onClick={() => setActiveSport(sport.id)}
            />
          ))}
        </div>

        <div className="mt-3 -mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1">
          <button
            onClick={() => setParishFilter(ALL_PARISHES)}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              parishFilter === ALL_PARISHES ? 'bg-cyan/15 text-cyan' : 'bg-surface text-ink-faint'
            }`}
          >
            All parishes
          </button>
          {PARISHES.map((p) => (
            <button
              key={p}
              onClick={() => setParishFilter(p)}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                parishFilter === p ? 'bg-cyan/15 text-cyan' : 'bg-surface text-ink-faint'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <Link
          to="/join"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-xs font-bold text-ink-dim"
        >
          <KeyRound size={13} /> Have a code? Join a private match
        </Link>
      </header>

      <main className="mt-2 flex flex-col gap-3 px-5">
        {rows.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <p className="text-3xl">🔍</p>
            <p className="text-sm font-semibold text-ink">No open play found</p>
            <p className="max-w-xs text-xs text-ink-faint">
              Try a different parish, switch sports, or start your own session.
            </p>
          </div>
        )}
        {rows.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </main>
    </div>
  );
}
