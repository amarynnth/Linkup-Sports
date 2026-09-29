import { Link } from 'react-router-dom';
import { MessageCircle, Users } from 'lucide-react';
import { useFriends } from '../context/FriendsContext';
import { useSessions } from '../context/SessionsContext';
import { useChat } from '../context/ChatContext';
import { useIdentity } from '../context/IdentityContext';
import { getSport } from '../data/mockData';
import { dmThreadId } from '../lib/chat';
import { formatWhen } from '../lib/geo';

export default function Chat() {
  const { friends } = useFriends();
  const { sessions, joinedSessionIds, hostedSessionIds } = useSessions();
  const { messages, isThreadUnread } = useChat();
  const { id: myId } = useIdentity();

  const myGameChats = sessions
    .filter((s) => joinedSessionIds.includes(s.id) || hostedSessionIds.includes(s.id))
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  const lastMessageFor = (scope: 'dm' | 'session', scopeId: string) => {
    const thread = messages.filter((m) => m.scope === scope && m.scopeId === scopeId);
    if (thread.length === 0) return null;
    return thread[thread.length - 1];
  };

  return (
    <div className="pb-24">
      <header className="px-5 pb-2 pt-8">
        <h1 className="font-display text-xl font-bold text-ink">Chat</h1>
        <p className="text-sm text-ink-faint">Friends and games you're part of</p>
      </header>

      <main className="mt-3 flex flex-col gap-6 px-5">
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-faint">Friends</p>
          {friends.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-ink-faint">
              Add friends from Profile → Friends to start chatting with them.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {friends.map((f) => {
                const threadId = dmThreadId(myId, f.id);
                const last = lastMessageFor('dm', threadId);
                const unread = isThreadUnread('dm', threadId);
                return (
                  <Link
                    key={f.id}
                    to={`/chat/dm/${f.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-ink-dim">
                      {f.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink">{f.name}</p>
                      <p className={`truncate text-xs ${unread ? 'font-semibold text-ink' : 'text-ink-faint'}`}>
                        {last ? (last.senderId === myId ? `You: ${last.body}` : last.body) : 'Say hi 👋'}
                      </p>
                    </div>
                    {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-faint">Your games</p>
          {myGameChats.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-ink-faint">
              Join or host an open play session to chat with everyone in it.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {myGameChats.map((s) => {
                const sport = getSport(s.sportId);
                const last = lastMessageFor('session', s.id);
                const unread = isThreadUnread('session', s.id);
                return (
                  <Link
                    key={s.id}
                    to={`/chat/session/${s.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
                      style={{ backgroundColor: `${sport.color}22` }}
                    >
                      {sport.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">
                        {sport.name} · {s.venueName}
                      </p>
                      <p className={`truncate text-xs ${unread ? 'font-semibold text-ink' : 'text-ink-faint'}`}>
                        {last ? `${last.senderName.split(' ')[0]}: ${last.body}` : `${formatWhen(s.startsAt)} · ${s.joined.length} in chat`}
                      </p>
                    </div>
                    {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />}
                    <span className="flex items-center gap-1 shrink-0 text-[10px] font-bold text-ink-faint">
                      <Users size={11} /> {s.joined.length}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {friends.length === 0 && myGameChats.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-2 text-center">
            <MessageCircle size={28} className="text-ink-faint" />
            <p className="max-w-xs text-xs text-ink-faint">
              Chats show up here once you add a friend or join an open play session.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
