import { Crown, Lock } from 'lucide-react';
import { useSessions } from '../context/SessionsContext';
import SessionCard from '../components/SessionCard';

export default function MyGames() {
  const { sessions, joinedSessionIds, hostedSessionIds } = useSessions();

  const mine = sessions
    .filter((s) => joinedSessionIds.includes(s.id))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return (
    <div className="pb-24">
      <header className="px-5 pb-2 pt-8">
        <h1 className="font-display text-xl font-bold text-ink">My Games</h1>
        <p className="text-sm text-ink-faint">Sessions you're hosting or joined</p>
      </header>

      <main className="mt-3 flex flex-col gap-3 px-5">
        {mine.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <p className="text-3xl">🎮</p>
            <p className="text-sm font-semibold text-ink">No games yet</p>
            <p className="max-w-xs text-xs text-ink-faint">
              Join an open play session from the feed, or start your own.
            </p>
          </div>
        )}
        {mine.map((s) => (
          <div key={s.id} className="relative">
            <div className="absolute -top-2 right-3 z-10 flex items-center gap-1.5">
              {s.isPrivate && (
                <span className="flex items-center gap-1 rounded-full bg-cyan px-2 py-0.5 text-[10px] font-bold text-void">
                  <Lock size={11} /> PRIVATE
                </span>
              )}
              {hostedSessionIds.includes(s.id) && (
                <span className="flex items-center gap-1 rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold text-void">
                  <Crown size={11} /> HOSTING
                </span>
              )}
            </div>
            <SessionCard session={s} />
          </div>
        ))}
      </main>
    </div>
  );
}
