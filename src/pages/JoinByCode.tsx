import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useSessions } from '../context/SessionsContext';
import PageHeader from '../components/PageHeader';

export default function JoinByCode() {
  const navigate = useNavigate();
  const { findByInviteCode } = useSessions();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const submit = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setSearching(true);
    setError('');
    try {
      const session = await findByInviteCode(trimmed);
      if (session) {
        navigate(`/session/${session.id}`);
      } else {
        setError("Couldn't find a private session with that code — double-check with whoever invited you.");
      }
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="pb-24">
      <PageHeader title="Join a private match" subtitle="Enter the code your host shared with you" />

      <div className="mt-4 flex flex-col items-center gap-5 px-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan/15 text-cyan">
          <KeyRound size={28} />
        </div>

        <input
          autoFocus
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="e.g. PBWEEK"
          maxLength={8}
          className="w-full max-w-xs rounded-xl border border-line bg-surface px-4 py-3.5 text-center font-display text-xl font-black tracking-[0.3em] text-ink placeholder:tracking-normal placeholder:text-ink-faint placeholder:font-sans placeholder:font-normal placeholder:text-base focus:border-cyan focus:outline-none"
        />

        {error && <p className="max-w-xs text-center text-xs text-coral">{error}</p>}

        <button
          disabled={!code.trim() || searching}
          onClick={submit}
          className="w-full max-w-xs rounded-xl bg-cyan py-3.5 text-sm font-bold text-void disabled:opacity-40"
        >
          {searching ? 'Looking…' : 'Find session'}
        </button>

        <p className="max-w-xs text-center text-xs text-ink-faint">
          Hosting a weekly game? Create a private session and you'll get a code to share right after.
        </p>
      </div>
    </div>
  );
}
