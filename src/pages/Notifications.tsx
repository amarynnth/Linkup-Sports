import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { getSport } from '../data/mockData';
import { formatWhen } from '../lib/geo';
import PageHeader from '../components/PageHeader';

export default function Notifications() {
  const { friendGames, markAllSeen } = useNotifications();

  // Visiting this page is what clears the badge.
  useEffect(() => {
    markAllSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pb-24">
      <PageHeader title="Notifications" subtitle="Open games your friends have posted" />

      <div className="mt-4 flex flex-col gap-3 px-5">
        {friendGames.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <Bell size={28} className="text-ink-faint" />
            <p className="text-sm font-semibold text-ink">No games from friends yet</p>
            <p className="max-w-xs text-xs text-ink-faint">
              Add friends from your Profile — you'll see it here the moment one of them posts an open game.
            </p>
          </div>
        )}
        {friendGames.map((s) => {
          const sport = getSport(s.sportId);
          return (
            <Link
              key={s.id}
              to={`/session/${s.id}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
                style={{ backgroundColor: `${sport.color}22` }}
              >
                {sport.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">
                  {s.hostName} posted a {sport.name.toLowerCase()} game
                </p>
                <p className="truncate text-xs text-ink-faint">
                  {s.venueName} · {formatWhen(s.startsAt)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
