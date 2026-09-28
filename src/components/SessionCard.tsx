import { Link } from 'react-router-dom';
import { MapPin, Users, Lock, Heart } from 'lucide-react';
import type { OpenPlaySession } from '../types';
import { getSport } from '../data/mockData';
import { formatWhen } from '../lib/geo';
import { formatCost, isFreeSession } from '../lib/cost';
import { useFriends } from '../context/FriendsContext';

export default function SessionCard({ session }: { session: OpenPlaySession }) {
  const sport = getSport(session.sportId);
  const spotsLeft = session.capacity - session.joined.length;
  const isFull = session.status === 'full' || spotsLeft <= 0;
  const free = isFreeSession(session);
  const { friends } = useFriends();
  const isFriendHosted = friends.some((f) => f.id === session.hostId);

  return (
    <Link
      to={`/session/${session.id}`}
      className={`block rounded-2xl border p-4 transition-colors active:border-ink-faint ${
        isFriendHosted ? 'border-coral/40 bg-coral/[0.04]' : 'border-line bg-surface'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-base"
            style={{ backgroundColor: `${sport.color}22` }}
          >
            {sport.emoji}
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
              {sport.name} · Open Play
              {session.isPrivate && <Lock size={12} className="text-cyan" />}
              {isFriendHosted && (
                <span className="flex items-center gap-0.5 rounded-full bg-coral/15 px-1.5 py-0.5 text-[9px] font-bold text-coral">
                  <Heart size={9} fill="currentColor" /> FRIEND
                </span>
              )}
            </p>
            <p className="text-xs text-ink-faint">{formatWhen(session.startsAt)}</p>
          </div>
        </div>

        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${
            isFull ? 'bg-surface-3 text-ink-faint' : 'bg-lime/15 text-lime'
          }`}
        >
          {isFull ? 'FULL' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-dim">
        <MapPin size={13} className="text-ink-faint" />
        <span className="truncate">{session.venueName}</span>
        <span className="ml-auto shrink-0 font-semibold text-ink-dim">{session.parish}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {session.joined.slice(0, 4).map((p) => (
              <span
                key={p.id}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-surface-3 text-[9px] font-bold text-ink-dim"
              >
                {p.initials}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1 text-xs text-ink-faint">
            <Users size={12} />
            {session.joined.length}/{session.capacity}
          </span>
        </div>
        <p className={`text-sm font-bold ${free ? 'text-lime' : 'text-ink'}`}>{formatCost(session)}</p>
      </div>
    </Link>
  );
}
