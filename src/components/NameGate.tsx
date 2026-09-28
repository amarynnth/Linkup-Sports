import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useIdentity } from '../context/IdentityContext';

/**
 * Shown once per device before the rest of the app, so every joined/hosted
 * session can show a real name instead of "Guest". No account, no
 * password — just a name stored on this device.
 */
export default function NameGate({ children }: { children: React.ReactNode }) {
  const { ready, name, setName } = useIdentity();
  const [draft, setDraft] = useState('');

  if (!ready) return null;
  if (name) return <>{children}</>;

  const submit = () => {
    if (draft.trim().length < 2) return;
    setName(draft);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-void bg-grid px-6">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime text-void glow-lime"
      >
        <Zap size={28} strokeWidth={2.5} fill="currentColor" />
      </motion.div>

      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink">What should we call you?</h1>
        <p className="mt-1.5 text-sm text-ink-dim">
          Your name shows up to friends when you host or join a game. No email, no password.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Your name"
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-center text-base font-semibold text-ink placeholder:text-ink-faint focus:border-lime focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={draft.trim().length < 2}
          className="w-full rounded-xl bg-lime px-4 py-3 text-sm font-bold text-void disabled:opacity-40"
        >
          Let's go
        </button>
      </div>
    </div>
  );
}
