import { useState } from 'react';
import { Copy, Check, UserPlus, UserMinus } from 'lucide-react';
import { useIdentity } from '../context/IdentityContext';
import { useFriends } from '../context/FriendsContext';
import PageHeader from '../components/PageHeader';

export default function Friends() {
  const { friendCode } = useIdentity();
  const { friends, isLive, addFriendByCode, removeFriend } = useFriends();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(friendCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable — the code is still shown on screen
    }
  };

  const submit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setStatus(null);
    const result = await addFriendByCode(code);
    if (result.ok) {
      setStatus({ kind: 'ok', message: 'Friend added!' });
      setCode('');
    } else {
      setStatus({ kind: 'error', message: result.error });
    }
    setSubmitting(false);
  };

  return (
    <div className="pb-24">
      <PageHeader title="Friends" subtitle="Add friends to get notified when they post a game" />

      <div className="mt-4 flex flex-col gap-6 px-5">
        <div className="rounded-2xl border border-lime/30 bg-lime/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-lime">Your friend code</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-display text-2xl font-black tracking-[0.2em] text-ink">{friendCode}</span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink-dim"
            >
              {copied ? <Check size={13} className="text-lime" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-ink-faint">Share this with a friend so they can add you.</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-faint">Add a friend</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setStatus(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Their friend code"
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-lime focus:outline-none"
            />
            <button
              disabled={!code.trim() || submitting}
              onClick={submit}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-lime px-4 py-3 text-sm font-bold text-void disabled:opacity-40"
            >
              <UserPlus size={15} /> Add
            </button>
          </div>
          {status && (
            <p className={`mt-2 text-xs ${status.kind === 'ok' ? 'text-lime' : 'text-coral'}`}>{status.message}</p>
          )}
          {!isLive && (
            <p className="mt-2 text-[11px] text-ink-faint">
              You're in demo mode, so adding real friends across devices isn't available yet — connect a live
              backend from Profile to add friends for real. The two friends below are a preview.
            </p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-faint">
            Your friends ({friends.length})
          </p>
          {friends.length === 0 && (
            <p className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-ink-faint">
              No friends added yet — share your code above to get started.
            </p>
          )}
          <div className="flex flex-col gap-2">
            {friends.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-line bg-surface p-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-ink-dim">
                    {f.initials}
                  </span>
                  <span className="text-sm font-semibold text-ink">{f.name}</span>
                </div>
                <button
                  onClick={() => removeFriend(f.id)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-faint"
                >
                  <UserMinus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
