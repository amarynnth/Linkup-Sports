import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { OpenPlaySession } from '../types';
import { useSessions } from './SessionsContext';
import { useFriends } from './FriendsContext';
import { useIdentity } from './IdentityContext';

const SEEN_KEY = 'linkup_notifications_seen_at';

interface NotificationsState {
  /** Public sessions hosted by a friend (not you), newest first. */
  friendGames: OpenPlaySession[];
  /** How many of those were posted since you last opened Notifications. */
  unseenCount: number;
  markAllSeen: () => void;
}

const NotificationsContext = createContext<NotificationsState | null>(null);

/**
 * In-app notifications for "a friend posted an open game." No push/SMS —
 * this only surfaces while the app is open (a live toast) or the next time
 * it's opened (a badge + list), via the same realtime connection sessions
 * already use. See the README for the plan to layer real push on top.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { sessions } = useSessions();
  const { friends } = useFriends();
  const { id: myId } = useIdentity();
  const [lastSeenAt, setLastSeenAt] = useState(
    () => localStorage.getItem(SEEN_KEY) || new Date(0).toISOString(),
  );

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);

  const friendGames = useMemo(() => {
    return sessions
      .filter((s) => !s.isPrivate && s.status !== 'cancelled' && s.hostId !== myId && friendIds.has(s.hostId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sessions, friendIds, myId]);

  const unseenCount = useMemo(() => {
    const seenMs = new Date(lastSeenAt).getTime();
    return friendGames.filter((s) => new Date(s.createdAt).getTime() > seenMs).length;
  }, [friendGames, lastSeenAt]);

  const markAllSeen = () => {
    const now = new Date().toISOString();
    setLastSeenAt(now);
    localStorage.setItem(SEEN_KEY, now);
  };

  return (
    <NotificationsContext.Provider value={{ friendGames, unseenCount, markAllSeen }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
