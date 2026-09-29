import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { FriendProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useIdentity } from './IdentityContext';

// Demo-mode friends: seeded so the friends/notifications feature is visible
// and testable immediately, before anyone has set up a live Supabase
// backend. These match two of the mock hosts in src/data/mockData.ts, so
// "new game from a friend" notifications have something to show right away.
const DEMO_FRIENDS: FriendProfile[] = [
  { id: 'p1', name: 'Ramona Chin', initials: 'RC', friendCode: 'DEMO-RC' },
  { id: 'p2', name: 'Devon Blake', initials: 'DB', friendCode: 'DEMO-DB' },
];

export type AddFriendResult = { ok: true } | { ok: false; error: string };

interface FriendsState {
  friends: FriendProfile[];
  loading: boolean;
  isLive: boolean;
  addFriendByCode: (code: string) => Promise<AddFriendResult>;
  /** Add someone you already know the id/name of — e.g. from a shared session's
   * chat — without the code-exchange step, since you're already both looking
   * at the same session. */
  addFriendById: (profile: { id: string; name: string; initials: string }) => Promise<AddFriendResult>;
  removeFriend: (friendId: string) => Promise<void>;
}

const FriendsContext = createContext<FriendsState | null>(null);

export function FriendsProvider({ children }: { children: ReactNode }) {
  const { id: myId, ready } = useIdentity();
  const [friends, setFriends] = useState<FriendProfile[]>(isSupabaseConfigured ? [] : DEMO_FRIENDS);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const refresh = useCallback(async () => {
    if (!supabase || !myId) return;
    const { data: rows, error: rowsError } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', myId);
    if (rowsError || !rows || rows.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }
    const friendIds = rows.map((r) => r.friend_id as string);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', friendIds);
    if (!profilesError && profiles) {
      setFriends(
        profiles.map((p) => ({ id: p.id, name: p.name, initials: p.initials, friendCode: p.friend_code })),
      );
    }
    setLoading(false);
  }, [myId]);

  useEffect(() => {
    if (!supabase || !ready || !myId) return;
    refresh();
  }, [refresh, ready, myId]);

  const addFriendByCode = async (code: string): Promise<AddFriendResult> => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return { ok: false, error: 'Enter a friend code.' };

    if (!supabase) {
      return {
        ok: false,
        error: 'Adding real friends needs live mode (connect Supabase) — see Profile for setup steps.',
      };
    }

    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('*')
      .eq('friend_code', normalized)
      .maybeSingle();

    if (lookupError) return { ok: false, error: lookupError.message };
    if (!profile) return { ok: false, error: "No one found with that code — double-check it with your friend." };
    if (profile.id === myId) return { ok: false, error: "That's your own code!" };
    if (friends.some((f) => f.id === profile.id)) return { ok: false, error: `${profile.name} is already your friend.` };

    const now = new Date().toISOString();
    const { error: insertError } = await supabase.from('friendships').insert([
      { id: `f-${myId}-${profile.id}`, user_id: myId, friend_id: profile.id, created_at: now },
      { id: `f-${profile.id}-${myId}`, user_id: profile.id, friend_id: myId, created_at: now },
    ]);
    if (insertError) return { ok: false, error: insertError.message };

    await refresh();
    return { ok: true };
  };

  const addFriendById = async (profile: { id: string; name: string; initials: string }): Promise<AddFriendResult> => {
    if (profile.id === myId) return { ok: false, error: "That's you!" };
    if (friends.some((f) => f.id === profile.id)) return { ok: true };

    if (!supabase) {
      // Demo mode: no shared backend to write a friendship row to, but
      // there's no reason to block the interaction locally either.
      setFriends((prev) => [...prev, { ...profile, friendCode: '' }]);
      return { ok: true };
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from('friendships').insert([
      { id: `f-${myId}-${profile.id}`, user_id: myId, friend_id: profile.id, created_at: now },
      { id: `f-${profile.id}-${myId}`, user_id: profile.id, friend_id: myId, created_at: now },
    ]);
    if (error) return { ok: false, error: error.message };

    await refresh();
    return { ok: true };
  };

  const removeFriend = async (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
    if (!supabase) return;
    await supabase.from('friendships').delete().eq('user_id', myId).eq('friend_id', friendId);
    await supabase.from('friendships').delete().eq('user_id', friendId).eq('friend_id', myId);
  };

  return (
    <FriendsContext.Provider
      value={{ friends, loading, isLive: isSupabaseConfigured, addFriendByCode, addFriendById, removeFriend }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error('useFriends must be used within FriendsProvider');
  return ctx;
}
