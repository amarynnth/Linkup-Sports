import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, X } from 'lucide-react';
import { useSessions } from '../context/SessionsContext';
import { useFriends } from '../context/FriendsContext';
import { useIdentity } from '../context/IdentityContext';
import { getSport } from '../data/mockData';
import type { OpenPlaySession } from '../types';

/**
 * Pops a banner the moment a friend's new public session lands via realtime,
 * while the app is open. This is the "live" half of in-app notifications —
 * the bell badge on the feed covers what happened while the app was closed.
 */
export default function FriendGameToast() {
  const { lastInsertedSession } = useSessions();
  const { friends } = useFriends();
  const { id: myId } = useIdentity();
  const navigate = useNavigate();
  const [toast, setToast] = useState<OpenPlaySession | null>(null);

  useEffect(() => {
    if (!lastInsertedSession) return;
    if (lastInsertedSession.isPrivate) return;
    if (lastInsertedSession.hostId === myId) return;
    if (!friends.some((f) => f.id === lastInsertedSession.hostId)) return;

    setToast(lastInsertedSession);
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [lastInsertedSession, friends, myId]);

  const sport = toast ? getSport(toast.sportId) : null;

  return (
    <AnimatePresence>
      {toast && sport && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="safe-top fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2"
        >
          <div
            onClick={() => {
              navigate(`/session/${toast.id}`);
              setToast(null);
            }}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-lime/40 bg-surface p-3.5 text-left shadow-xl shadow-black/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime/15 text-lime">
              <PartyPopper size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">{toast.hostName} just posted a game</p>
              <p className="truncate text-xs text-ink-faint">
                {sport.emoji} {sport.name} · {toast.venueName}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToast(null);
              }}
              className="shrink-0 text-ink-faint"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
