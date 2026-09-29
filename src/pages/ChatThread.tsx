import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, UserPlus, Check } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useFriends } from '../context/FriendsContext';
import { useSessions } from '../context/SessionsContext';
import { useIdentity } from '../context/IdentityContext';
import { getSport } from '../data/mockData';
import { dmThreadId } from '../lib/chat';
import type { ChatScope } from '../types';

export default function ChatThread() {
  const { scope, scopeId } = useParams<{ scope: string; scopeId: string }>();
  const navigate = useNavigate();
  const { messages, sendMessage } = useChat();
  const { friends, addFriendById } = useFriends();
  const { sessions } = useSessions();
  const { id: myId } = useIdentity();

  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [justAdded, setJustAdded] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const isSession = scope === 'session';
  const session = isSession ? sessions.find((s) => s.id === scopeId) : undefined;
  const friend = !isSession ? friends.find((f) => f.id === scopeId) : undefined;

  const threadId = isSession ? (scopeId ?? '') : dmThreadId(myId, scopeId ?? '');
  const effectiveScope: ChatScope = isSession ? 'session' : 'dm';

  const thread = useMemo(
    () => messages.filter((m) => m.scope === effectiveScope && m.scopeId === threadId),
    [messages, effectiveScope, threadId]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [thread.length]);

  if (isSession && !session) {
    return (
      <div className="p-6 text-center text-ink-dim">
        Chat not found.
        <button onClick={() => navigate('/chat')} className="mt-2 block text-lime">Back to Chat</button>
      </div>
    );
  }
  if (!isSession && !friend) {
    return (
      <div className="p-6 text-center text-ink-dim">
        Chat not found.
        <button onClick={() => navigate('/chat')} className="mt-2 block text-lime">Back to Chat</button>
      </div>
    );
  }

  const sport = session ? getSport(session.sportId) : null;
  const title = session ? `${sport!.emoji} ${session.venueName}` : friend!.name;
  const subtitle = session ? `${session.joined.length} in this chat` : 'Direct message';

  const handleSend = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    setSendError('');
    try {
      await sendMessage(effectiveScope, threadId, draft);
      setDraft('');
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Couldn't send — check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  const handleAddFriend = async (p: { id: string; name: string; initials: string }) => {
    const result = await addFriendById(p);
    if (result.ok) {
      setJustAdded((prev) => ({ ...prev, [p.id]: true }));
    }
  };

  return (
    <div className="pb-48">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-void/95 px-5 py-4 backdrop-blur-lg">
        <button onClick={() => navigate('/chat')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink-dim">
          <ArrowLeft size={17} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{title}</p>
          <p className="text-xs text-ink-faint">{subtitle}</p>
        </div>
      </header>

      {session && (
        <div className="flex gap-3 overflow-x-auto border-b border-line px-5 py-3">
          {session.joined
            .filter((p) => p.id !== myId)
            .map((p) => {
              const isFriend = friends.some((f) => f.id === p.id) || justAdded[p.id];
              return (
                <div key={p.id} className="flex shrink-0 flex-col items-center gap-1">
                  <div className="relative">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-ink-dim">
                      {p.initials}
                    </span>
                    {!isFriend && (
                      <button
                        onClick={() => handleAddFriend(p)}
                        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-lime text-void"
                        aria-label={`Add ${p.name} as a friend`}
                      >
                        <UserPlus size={11} strokeWidth={2.5} />
                      </button>
                    )}
                    {isFriend && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan text-void">
                        <Check size={11} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                  <p className="max-w-[3.5rem] truncate text-[10px] text-ink-faint">{p.name.split(' ')[0]}</p>
                </div>
              );
            })}
        </div>
      )}

      <main className="px-5 py-4">
        {thread.length === 0 && (
          <p className="mt-8 text-center text-xs text-ink-faint">
            {session ? 'No messages yet — say hi to everyone in this game.' : `No messages yet — say hi to ${friend!.name.split(' ')[0]}.`}
          </p>
        )}
        <div className="flex flex-col gap-3">
          {thread.map((m) => {
            const mine = m.senderId === myId;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                {session && !mine && (
                  <p className="mb-0.5 px-1 text-[10px] font-semibold text-ink-faint">{m.senderName.split(' ')[0]}</p>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    mine ? 'bg-lime text-void' : 'border border-line bg-surface text-ink'
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </main>

      {sendError && (
        <div className="fixed bottom-[136px] left-0 right-0 z-30 px-5">
          <p className="mx-auto max-w-md rounded-xl border border-coral/40 bg-coral/10 px-4 py-2.5 text-center text-xs font-semibold text-coral">
            {sendError}
          </p>
        </div>
      )}

      <div className="safe-bottom fixed bottom-20 left-0 right-0 z-30 flex items-center gap-2 border-t border-line bg-void/95 px-4 py-3 backdrop-blur-lg">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message…"
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-lime focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-void disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
