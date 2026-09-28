import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Wallet, Trophy, Lock, Copy, Check, Banknote, Landmark } from 'lucide-react';
import { getSport } from '../data/mockData';
import { useSessions } from '../context/SessionsContext';
import { formatWhen } from '../lib/geo';
import { costPerPerson, formatCost, isFreeSession } from '../lib/cost';
import PageHeader from '../components/PageHeader';

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessions, joinedSessionIds, join, leave } = useSessions();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const session = sessions.find((s) => s.id === id);
  if (!session) {
    return (
      <div className="p-6 text-center text-ink-dim">
        Session not found.
        <button onClick={() => navigate('/')} className="mt-2 block text-lime">Back to feed</button>
      </div>
    );
  }

  const sport = getSport(session.sportId);
  const spotsLeft = session.capacity - session.joined.length;
  const isJoined = joinedSessionIds.includes(session.id);
  const isFull = session.status === 'full' && !isJoined;
  const free = isFreeSession(session);
  const perPerson = costPerPerson(session);

  const handleJoin = async () => {
    setBusy(true);
    try {
      await join(session.id);
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    setBusy(true);
    try {
      await leave(session.id);
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async () => {
    if (!session.inviteCode) return;
    try {
      await navigator.clipboard.writeText(session.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable — the code is still shown on screen
    }
  };

  return (
    <div className="pb-48">
      <PageHeader title="Open Play" subtitle={sport.name} />

      <div
        className="mx-5 flex h-36 items-end rounded-2xl p-4"
        style={{ backgroundColor: `${sport.color}1a` }}
      >
        <span className="rounded-lg bg-black/40 px-2.5 py-1 text-xs font-bold text-ink backdrop-blur-sm">
          {sport.emoji} {sport.name}{session.facilityName ? ` · ${session.facilityName}` : ''}
        </span>
        {session.isPrivate && (
          <span className="ml-auto flex items-center gap-1 rounded-lg bg-black/40 px-2.5 py-1 text-xs font-bold text-cyan backdrop-blur-sm">
            <Lock size={11} /> Private
          </span>
        )}
      </div>

      <div className="mt-4 px-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">{session.venueName}</h2>
            <p className="flex items-center gap-1 text-xs text-ink-faint">
              <MapPin size={12} /> {session.parish}
            </p>
          </div>
        </div>

        <p className="mt-1 text-xs text-ink-faint">Hosted by {session.hostName}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <InfoTile icon={Clock} label="When" value={formatWhen(session.startsAt)} />
          <InfoTile icon={Users} label="Roster" value={`${session.joined.length} / ${session.capacity} joined`} />
          <InfoTile icon={Trophy} label="Skill level" value={session.skillLevel} />
          <InfoTile icon={Wallet} label="Cost" value={formatCost(session)} />
        </div>

        {session.isPrivate && session.inviteCode && (
          <div className="mt-4 rounded-xl border border-cyan/30 bg-cyan/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan">Invite code</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-display text-2xl font-black tracking-[0.2em] text-ink">{session.inviteCode}</span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink-dim"
              >
                {copied ? <Check size={13} className="text-lime" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-ink-faint">Share this with your crew so they can join from Discover → "Have a code?"</p>
          </div>
        )}

        {!free && session.payment && (
          <div className="mt-4 rounded-xl border border-line bg-surface p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">How to pay</p>
            <div className="flex flex-wrap gap-2">
              {(session.payment.type === 'cash' || session.payment.type === 'both') && (
                <span className="flex items-center gap-1.5 rounded-full bg-surface-3 px-3 py-1.5 text-xs font-semibold text-ink-dim">
                  <Banknote size={13} /> Cash
                </span>
              )}
              {(session.payment.type === 'account' || session.payment.type === 'both') && (
                <span className="flex items-center gap-1.5 rounded-full bg-surface-3 px-3 py-1.5 text-xs font-semibold text-ink-dim">
                  <Landmark size={13} /> Account
                </span>
              )}
            </div>
            {session.payment.accountInfo && (
              <p className="mt-2.5 text-sm font-semibold text-ink">{session.payment.accountInfo}</p>
            )}
            {session.payment.note && (
              <p className="mt-1 text-xs text-ink-faint">{session.payment.note}</p>
            )}
            {session.isPrivate && (
              <p className="mt-2 text-[11px] text-ink-faint">
                ${perPerson.toLocaleString()} JMD each, split across {session.joined.length} joined right now — updates as more people join.
              </p>
            )}
          </div>
        )}

        {session.notes && (
          <div className="mt-4 rounded-xl border border-line bg-surface p-3.5 text-sm text-ink-dim">
            "{session.notes}"
          </div>
        )}

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Who's in</p>
          <div className="flex flex-wrap gap-2">
            {session.joined.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-ink-dim">
                  {p.initials}
                </span>
                <span className="text-xs font-semibold text-ink-dim">{p.name.split(' ')[0]}</span>
              </div>
            ))}
            {Array.from({ length: Math.max(0, spotsLeft) }).map((_, i) => (
              <div
                key={`open-${i}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-line text-ink-faint"
              >
                +
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="safe-bottom fixed bottom-20 left-0 right-0 z-30 border-t border-line bg-void/95 p-4 backdrop-blur-lg">
        {isJoined ? (
          <button
            disabled={busy}
            onClick={handleLeave}
            className="w-full rounded-xl border border-coral/40 bg-coral/10 py-3.5 text-sm font-bold text-coral disabled:opacity-50"
          >
            Leave session
          </button>
        ) : (
          <button
            disabled={isFull || busy}
            onClick={handleJoin}
            className={`w-full rounded-xl py-3.5 text-sm font-bold transition-colors ${
              isFull ? 'bg-surface-3 text-ink-faint' : 'bg-lime text-void glow-lime disabled:opacity-60'
            }`}
          >
            {isFull ? 'Session full' : free ? 'Join · Free' : `Join · $${perPerson.toLocaleString()} JMD`}
          </button>
        )}
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-ink-faint">
        <Icon size={13} />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-bold text-ink">{value}</p>
    </div>
  );
}
