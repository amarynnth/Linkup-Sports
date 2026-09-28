import type { Sport } from '../types';

export default function SportChip({
  sport,
  active,
  onClick,
}: {
  sport: Sport | { id: 'all'; name: string; emoji: string; color: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all ${
        active
          ? 'border-transparent bg-ink text-void'
          : 'border-line bg-surface text-ink-dim hover:border-ink-faint'
      }`}
      style={active && sport.id !== 'all' ? { backgroundColor: sport.color, color: '#05060a' } : undefined}
    >
      <span>{sport.emoji}</span>
      {sport.name}
    </button>
  );
}
