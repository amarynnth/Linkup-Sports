import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { useFriends } from '../context/FriendsContext';
import { getSport } from '../data/mockData';
import { formatWhen } from '../lib/geo';
import PageHeader from '../components/PageHeader';

export default function Notifications() {
  const { friendGames, friendRequests, markAllSeen } = useNotifications();
  const { acceptRequest, declineRequest } = useFriends();
  const [responding, setResponding] = useState<Record<string, boolean>>({});

  // Visiting this page is what clears the friend-game badge — friend
  // requests stay counted until you actually Accept/Decline them, since a
  // request you've merely seen isn't resolved.
  useEffect(() => {
    markAllSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const respond = async (fromId: string, action: 'accept' | 'decline') => {
    setResponding((prev) => ({ ...prev, [fromId]: true }));
    try {
      if (action === 'accept') await acceptRequest(fromId);
      else await declineRequest(fromId);
    } finally {
      setResponding((prev) => ({ ...prev, [fromId]: false }));
    }
  };

  return (
    <div className="pb-24">
      <PageHeader title="Notifications" subtitle="Open games your friends have posted" />

      <div className="mt-4 flex flex-col gap-3 px-5">
        {friendRequests.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              Friend requests ({friendRequests.length})
            </p>
            {friendRequests.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-2xl border border-lime/30 bg-lime/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-ink-dim">
                    {f.initials}
                  </span>
                  <p className="text-sm font-bold text-ink">{f.name} wants to be friends</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={responding[f.id]}
                    onClick={() => respond(f.id, 'accept')}
                    className="flex items-center gap-1 rounded-lg bg-lime px-2.5 py-1.5 text-xs font-bold text-void disabled:opacity-40"
                  >
                    <Check size={13} /> Accept
                  </button>
                  <button
                    disabled={responding[f.id]}
                    onClick={() => respond(f.id, 'decline')}
                    className="flex items-center justify-center rounded-lg border border-line bg-surface px-2 py-1.5 text-ink-faint disabled:opacity-40"
                    aria-label={`Decline ${f.name}'s request`}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {friendGames.length === 0 && friendRequests.length === 0 && (
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
