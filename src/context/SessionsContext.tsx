import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { OpenPlaySession, PaymentInfo, SessionParticipant } from '../types';
import { INITIAL_SESSIONS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { generateCode } from '../lib/codes';
import { useIdentity } from './IdentityContext';

export interface CreateSessionInput {
  venueName: string;
  parish: string;
  facilityName?: string;
  sportId: string;
  startsAt: string;
  durationMins: number;
  capacity: number;
  skillLevel: OpenPlaySession['skillLevel'];
  isPrivate: boolean;
  costPerPersonJmd?: number;
  totalCostJmd?: number;
  payment?: PaymentInfo;
  notes?: string;
}

interface SessionsState {
  sessions: OpenPlaySession[];
  loading: boolean;
  /** True when connected to a live Supabase backend; false in local demo mode. */
  isLive: boolean;
  joinedSessionIds: string[];
  hostedSessionIds: string[];
  /**
   * The most recent session inserted via realtime (live mode only) — used by
   * the notification watcher to detect a freshly-posted friend's game while
   * the app is open. Not meaningful in local demo mode.
   */
  lastInsertedSession: OpenPlaySession | null;
  join: (sessionId: string) => Promise<void>;
  leave: (sessionId: string) => Promise<void>;
  createSession: (input: CreateSessionInput) => Promise<string>;
  findByInviteCode: (code: string) => Promise<OpenPlaySession | null>;
}

const SessionsContext = createContext<SessionsState | null>(null);

// --- Supabase row <-> app type mapping -------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSession(row: any): OpenPlaySession {
  let payment: PaymentInfo | undefined;
  if (row.payment_type) {
    payment = {
      type: row.payment_type,
      accountInfo: row.payment_account_info ?? undefined,
      note: row.payment_note ?? undefined,
    };
  }
  return {
    id: row.id,
    venueName: row.venue_name,
    parish: row.parish,
    facilityName: row.facility_name ?? undefined,
    sportId: row.sport_id,
    hostId: row.host_id,
    hostName: row.host_name,
    createdAt: row.created_at,
    startsAt: row.starts_at,
    durationMins: row.duration_mins,
    capacity: row.capacity,
    joined: (row.joined ?? []) as SessionParticipant[],
    skillLevel: row.skill_level,
    isPrivate: row.is_private,
    inviteCode: row.invite_code ?? undefined,
    costPerPersonJmd: row.cost_per_person_jmd ?? undefined,
    totalCostJmd: row.total_cost_jmd ?? undefined,
    payment,
    notes: row.notes ?? undefined,
    status: row.status,
  };
}

function sessionToRow(s: OpenPlaySession) {
  return {
    id: s.id,
    venue_name: s.venueName,
    parish: s.parish,
    facility_name: s.facilityName ?? null,
    sport_id: s.sportId,
    host_id: s.hostId,
    host_name: s.hostName,
    created_at: s.createdAt,
    starts_at: s.startsAt,
    duration_mins: s.durationMins,
    capacity: s.capacity,
    joined: s.joined,
    skill_level: s.skillLevel,
    is_private: s.isPrivate,
    invite_code: s.inviteCode ?? null,
    cost_per_person_jmd: s.costPerPersonJmd ?? null,
    total_cost_jmd: s.totalCostJmd ?? null,
    payment_type: s.payment?.type ?? null,
    payment_account_info: s.payment?.accountInfo ?? null,
    payment_note: s.payment?.note ?? null,
    notes: s.notes ?? null,
    status: s.status,
  };
}

export function SessionsProvider({ children }: { children: ReactNode }) {
  const { id: myId, name: myName, initials: myInitials } = useIdentity();
  const [sessions, setSessions] = useState<OpenPlaySession[]>(isSupabaseConfigured ? [] : INITIAL_SESSIONS);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [lastInsertedSession, setLastInsertedSession] = useState<OpenPlaySession | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('sessions').select('*').order('starts_at', { ascending: true });
    if (!error && data) setSessions(data.map(rowToSession));
    setLoading(false);
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    refresh();
    const channel = client
      .channel('sessions-changes')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload: any) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          setLastInsertedSession(rowToSession(payload.new));
        }
        refresh();
      })
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [refresh]);

  const me: SessionParticipant = { id: myId, name: myName || 'Guest', initials: myInitials };

  const joinedSessionIds = myId ? sessions.filter((s) => s.joined.some((p) => p.id === myId)).map((s) => s.id) : [];
  const hostedSessionIds = myId ? sessions.filter((s) => s.hostId === myId).map((s) => s.id) : [];

  const join = async (sessionId: string) => {
    const current = sessions.find((x) => x.id === sessionId);
    if (!current || current.joined.some((p) => p.id === myId)) return;
    const joined = [...current.joined, me];
    const updated: OpenPlaySession = {
      ...current,
      joined,
      status: joined.length >= current.capacity ? 'full' : current.status,
    };
    setSessions((prev) => prev.map((x) => (x.id === sessionId ? updated : x)));
    if (supabase) {
      const { error } = await supabase
        .from('sessions')
        .update({ joined: updated.joined, status: updated.status })
        .eq('id', sessionId);
      if (error) console.error('Failed to sync join to Supabase:', error.message);
    }
  };

  const leave = async (sessionId: string) => {
    const current = sessions.find((x) => x.id === sessionId);
    if (!current) return;
    const joined = current.joined.filter((p) => p.id !== myId);
    const updated: OpenPlaySession = {
      ...current,
      joined,
      status: current.status === 'full' && joined.length < current.capacity ? 'open' : current.status,
    };
    setSessions((prev) => prev.map((x) => (x.id === sessionId ? updated : x)));
    if (supabase) {
      const { error } = await supabase
        .from('sessions')
        .update({ joined: updated.joined, status: updated.status })
        .eq('id', sessionId);
      if (error) console.error('Failed to sync leave to Supabase:', error.message);
    }
  };

  const createSession = async (input: CreateSessionInput) => {
    const id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newSession: OpenPlaySession = {
      ...input,
      id,
      hostId: myId,
      hostName: myName || 'Guest',
      createdAt: new Date().toISOString(),
      joined: [me],
      status: 'open',
      inviteCode: input.isPrivate ? generateCode() : undefined,
    };
    if (supabase) {
      const { error } = await supabase.from('sessions').insert(sessionToRow(newSession));
      if (error) {
        // Don't add it locally either — a session that only exists on this
        // device would look posted to the host but be invisible to
        // everyone else, and its invite code would never resolve for
        // friends trying to join. Surface the failure instead so the host
        // knows to retry (a common cause: the database migration for a
        // recent update hasn't been run yet).
        throw new Error(`Couldn't post this session: ${error.message}`);
      }
    }
    setSessions((prev) => [newSession, ...prev]);
    return id;
  };

  const findByInviteCode = async (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return null;
    if (supabase) {
      const { data } = await supabase.from('sessions').select('*').eq('invite_code', normalized).maybeSingle();
      return data ? rowToSession(data) : null;
    }
    return sessions.find((s) => s.isPrivate && s.inviteCode === normalized) ?? null;
  };

  return (
    <SessionsContext.Provider
      value={{
        sessions,
        loading,
        isLive: isSupabaseConfigured,
        joinedSessionIds,
        hostedSessionIds,
        lastInsertedSession,
        join,
        leave,
        createSession,
        findByInviteCode,
      }}
    >
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) throw new Error('useSessions must be used within SessionsProvider');
  return ctx;
}
