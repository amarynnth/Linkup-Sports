import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { ChatMessage, ChatScope } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useIdentity } from './IdentityContext';
import { dmThreadId } from '../lib/chat';

const DEMO_MESSAGES_KEY = 'linkup_demo_messages';
const DEMO_SEEDED_KEY = 'linkup_demo_messages_seeded';

function loadDemoMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(DEMO_MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDemoMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(messages));
  } catch {
    // storage unavailable — messages just won't persist across reloads
  }
}

// --- Supabase row <-> app type mapping -------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMessage(row: any): ChatMessage {
  return {
    id: row.id,
    scope: row.scope,
    scopeId: row.scope_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderInitials: row.sender_initials,
    body: row.body,
    createdAt: row.created_at,
  };
}

function messageToRow(m: ChatMessage) {
  return {
    id: m.id,
    scope: m.scope,
    scope_id: m.scopeId,
    sender_id: m.senderId,
    sender_name: m.senderName,
    sender_initials: m.senderInitials,
    body: m.body,
    created_at: m.createdAt,
  };
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  isLive: boolean;
  /** Throws if the message couldn't be saved (e.g. a failed live-mode write) — callers should surface that instead of assuming it sent. */
  sendMessage: (scope: ChatScope, scopeId: string, body: string) => Promise<void>;
}

const ChatContext = createContext<ChatState | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { id: myId, name: myName, initials: myInitials } = useIdentity();
  const [messages, setMessages] = useState<ChatMessage[]>(isSupabaseConfigured ? [] : loadDemoMessages());
  const [loading, setLoading] = useState(isSupabaseConfigured);

  // Demo-mode seed: gives a freshly-opened demo something to look at in a DM
  // with one of the seeded demo friends (see FriendsContext). Deferred to an
  // effect (rather than computed at module load) because it needs the real
  // per-device identity id, which IdentityContext only knows once its own
  // effect has read it from localStorage.
  useEffect(() => {
    if (isSupabaseConfigured || !myId) return;
    try {
      if (localStorage.getItem(DEMO_SEEDED_KEY)) return;
      localStorage.setItem(DEMO_SEEDED_KEY, '1');
    } catch {
      return;
    }
    const seedMsg: ChatMessage = {
      id: 'dm-seed-1',
      scope: 'dm',
      scopeId: dmThreadId(myId, 'p1'),
      senderId: 'p1',
      senderName: 'Ramona Chin',
      senderInitials: 'RC',
      body: 'Hey! You in for pickleball this week?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    };
    setMessages((prev) => {
      const next = [...prev, seedMsg];
      saveDemoMessages(next);
      return next;
    });
  }, [myId]);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (!error && data) setMessages(data.map(rowToMessage));
    setLoading(false);
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    refresh();
    const channel = client
      .channel('messages-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        refresh();
      })
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [refresh]);

  const sendMessage = async (scope: ChatScope, scopeId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed || !myId) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      scope,
      scopeId,
      senderId: myId,
      senderName: myName || 'Guest',
      senderInitials: myInitials,
      body: trimmed,
      createdAt: new Date().toISOString(),
    };
    if (supabase) {
      const { error } = await supabase.from('messages').insert(messageToRow(msg));
      if (error) {
        // Don't add it locally either — a message that only exists on this
        // device would look sent to you but never reach the other person,
        // same lesson as session posting: fail loudly, not silently.
        throw new Error(`Couldn't send: ${error.message}`);
      }
      setMessages((prev) => [...prev, msg]);
      return;
    }
    setMessages((prev) => {
      const next = [...prev, msg];
      saveDemoMessages(next);
      return next;
    });
  };

  return (
    <ChatContext.Provider value={{ messages, loading, isLive: isSupabaseConfigured, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
