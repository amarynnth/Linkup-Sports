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

export type AddFriendResult =
  | { ok: true; pending: boolean }
  | { ok: false; error: string };

interface FriendsState {
  friends: FriendProfile[];
  /** Requests you've sent that the other person hasn't accepted yet. */
  pendingOutgoing: FriendProfile[];
  /** Requests someone else sent you, waiting on your Accept/Decline. */
  pendingIncoming: FriendProfile[];
  loading: boolean;
  isLive: boolean;
  addFriendByCode: (code: string) => Promise<AddFriendResult>;
  /** Add someone you already know the id/name of — e.g. from a shared session's
   * chat — without the code-exchange step, since you're already both looking
   * at the same session. Sends a request (live mode) unless they'd already
   * requested you, in which case this accepts theirs instead. */
  addFriendById: (profile: { id: string; name: string; initials: string }) => Promise<AddFriendResult>;
  acceptRequest: (fromId: string) => Promise<void>;
  declineRequest: (fromId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
}

const FriendsContext = createContext<FriendsState | null>(null);

export function FriendsProvider({ children }: { children: ReactNode }) {
  const { id: myId, ready } = useIdentity();
  const [friends, setFriends] = useState<FriendProfile[]>(isSupabaseConfigured ? [] : DEMO_FRIENDS);
  const [pendingOutgoing, setPendingOutgoing] = useState<FriendProfile[]>([]);
  const [pendingIncoming, setPendingIncoming] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const refresh = useCallback(async () => {
    if (!supabase || !myId) return;

    // Rows I created: split into accepted friends vs requests I'm still
    // waiting on the other person to accept.
    const { data: myRows, error: myRowsError } = await supabase
      .from('friendships')
      .select('friend_id, status')
      .eq('user_id', myId);

    // Rows someone else created pointed at me, still pending — these are
    // the requests waiting on ME.
    const { data: incomingRows, error: incomingError } = await supabase
      .from('friendships')
      .select('user_id')
      .eq('friend_id', myId)
      .eq('status', 'pending');

    if (myRowsError || !myRows) {
      setFriends([]);
      setPendingOutgoing([]);
    }
    if (incomingError || !incomingRows) {
      setPendingIncoming([]);
    }

    const acceptedIds = (myRows ?? []).filter((r) => r.status === 'accepted').map((r) => r.friend_id as string);
    const outgoingIds = (myRows ?? []).filter((r) => r.status === 'pending').map((r) => r.friend_id as string);
    const incomingIds = (incomingRows ?? []).map((r) => r.user_id as string);

    const allIds = [...new Set([...acceptedIds, ...outgoingIds, ...incomingIds])];
    if (allIds.length === 0) {
      setFriends([]);
      setPendingOutgoing([]);
      setPendingIncoming([]);
      setLoading(false);
      return;
    }

    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').in('id', allIds);
    if (profilesError || !profiles) {
      setLoading(false);
      return;
    }
    const toProfile = (id: string): FriendProfile | undefined => {
      const p = profiles.find((row) => row.id === id);
      return p ? { id: p.id, name: p.name, initials: p.initials, friendCode: p.friend_code } : undefined;
    };

    setFriends(acceptedIds.map(toProfile).filter((p): p is FriendProfile => !!p));
    setPendingOutgoing(outgoingIds.map(toProfile).filter((p): p is FriendProfile => !!p));
    setPendingIncoming(incomingIds.map(toProfile).filter((p): p is FriendProfile => !!p));
    setLoading(false);
  }, [myId]);

  useEffect(() => {
    const client = supabase;
    if (!client || !ready || !myId) return;
    refresh();
    const channel = client
      .channel('friendships-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
        refresh();
      })
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [refresh, ready, myId]);

  const sendRequestOrAccept = async (profile: { id: string; name: string; initials: string }): Promise<AddFriendResult> => {
    if (!supabase || !myId) return { ok: false, error: 'Not ready yet — try again in a moment.' };

    // They already asked me first — one-tap "add" from my side should just
    // accept theirs rather than create a redundant second pending row.
    if (pendingIncoming.some((f) => f.id === profile.id)) {
      await acceptRequestInternal(profile.id);
      return { ok: true, pending: false };
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('friendships')
      .insert([{ id: `f-${myId}-${profile.id}`, user_id: myId, friend_id: profile.id, status: 'pending', created_at: now }]);
    if (error) return { ok: false, error: error.message };

    await refresh();
    return { ok: true, pending: true };
  };

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
    if (pendingOutgoing.some((f) => f.id === profile.id)) return { ok: false, error: `Request already sent to ${profile.name} — waiting on them to accept.` };

    return sendRequestOrAccept({ id: profile.id, name: profile.name, initials: profile.initials });
  };

  const addFriendById = async (profile: { id: string; name: string; initials: string }): Promise<AddFriendResult> => {
    if (profile.id === myId) return { ok: false, error: "That's you!" };
    if (friends.some((f) => f.id === profile.id)) return { ok: true, pending: false };
    if (pendingOutgoing.some((f) => f.id === profile.id)) return { ok: true, pending: true };

    if (!supabase) {
      // Demo mode: no second device to send a request to, so there's no
      // reason to block the interaction — add instantly, same as before.
      setFriends((prev) => [...prev, { ...profile, friendCode: '' }]);
      return { ok: true, pending: false };
    }

    return sendRequestOrAccept(profile);
  };

  // Shared by acceptRequest (public) and the auto-accept path inside
  // sendRequestOrAccept, which already knows the request exists.
  const acceptRequestInternal = async (fromId: string) => {
    if (!supabase || !myId) return;
    const now = new Date().toISOString();
    await supabase.from('friendships').update({ status: 'accepted' }).eq('user_id', fromId).eq('friend_id', myId);
    await supabase
      .from('friendships')
      .upsert({ id: `f-${myId}-${fromId}`, user_id: myId, friend_id: fromId, status: 'accepted', created_at: now });
    await refresh();
  };

  const acceptRequest = async (fromId: string) => {
    await acceptRequestInternal(fromId);
  };

  const declineRequest = async (fromId: string) => {
    if (!supabase || !myId) return;
    setPendingIncoming((prev) => prev.filter((f) => f.id !== fromId));
    await supabase.from('friendships').delete().eq('user_id', fromId).eq('friend_id', myId);
  };

  const removeFriend = async (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
    setPendingOutgoing((prev) => prev.filter((f) => f.id !== friendId));
    if (!supabase) return;
    await supabase.from('friendships').delete().eq('user_id', myId).eq('friend_id', friendId);
    await supabase.from('friendships').delete().eq('user_id', friendId).eq('friend_id', myId);
  };

  return (
    <FriendsContext.Provider
      value={{
        friends,
        pendingOutgoing,
        pendingIncoming,
        loading,
        isLive: isSupabaseConfigured,
        addFriendByCode,
        addFriendById,
        acceptRequest,
        declineRequest,
        removeFriend,
      }}
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
