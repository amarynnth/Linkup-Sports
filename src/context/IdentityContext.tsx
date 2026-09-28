import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { generateCode } from '../lib/codes';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const ID_KEY = 'linkup_player_id';
const NAME_KEY = 'linkup_player_name';
const FRIEND_CODE_KEY = 'linkup_friend_code';

function randomId() {
  return 'p-' + Math.random().toString(36).slice(2, 10);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface IdentityState {
  /** Stable per-device id, generated once and stored locally. */
  id: string;
  name: string;
  initials: string;
  /** Shareable 6-character code other players enter to add this person as a friend. */
  friendCode: string;
  /** True once localStorage has been read, so callers don't flash a name prompt. */
  ready: boolean;
  setName: (name: string) => void;
}

const IdentityContext = createContext<IdentityState | null>(null);

/**
 * A lightweight stand-in for real accounts: each device gets a random id
 * the first time it opens the app, and the player picks a display name.
 * No login, no password, no email — good enough for testing with friends,
 * upgrade to real Supabase Auth later if the app needs real accounts.
 *
 * In live mode, this also keeps a `profiles` row in Supabase in sync
 * (id/name/initials/friend_code) so other devices can look this player up
 * by their friend code — see FriendsContext.
 */
export function IdentityProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState('');
  const [name, setNameState] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let storedId = localStorage.getItem(ID_KEY);
    if (!storedId) {
      storedId = randomId();
      localStorage.setItem(ID_KEY, storedId);
    }
    let storedCode = localStorage.getItem(FRIEND_CODE_KEY);
    if (!storedCode) {
      storedCode = generateCode();
      localStorage.setItem(FRIEND_CODE_KEY, storedCode);
    }
    const storedName = localStorage.getItem(NAME_KEY) || '';
    setId(storedId);
    setFriendCode(storedCode);
    setNameState(storedName);
    setReady(true);
  }, []);

  // Keep a profiles row in sync in live mode, so other devices can resolve
  // this friend code to a name. Runs whenever the identity is ready and a
  // name is set (skipped entirely in demo mode).
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !ready || !id || !name) return;
    supabase
      .from('profiles')
      .upsert({ id, name, initials: getInitials(name), friend_code: friendCode, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (error) console.error('Failed to sync profile:', error.message);
      });
  }, [ready, id, name, friendCode]);

  const setName = (n: string) => {
    const trimmed = n.trim();
    setNameState(trimmed);
    localStorage.setItem(NAME_KEY, trimmed);
  };

  return (
    <IdentityContext.Provider
      value={{ id, name, initials: getInitials(name || '?'), friendCode, ready, setName }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider');
  return ctx;
}
