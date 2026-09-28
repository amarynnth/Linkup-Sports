import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-void/95 px-5 py-5 backdrop-blur-lg">
      <button
        onClick={() => navigate(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink"
      >
        <ArrowLeft size={17} />
      </button>
      <div>
        <h1 className="text-base font-bold text-ink">{title}</h1>
        {subtitle && <p className="text-xs text-ink-faint">{subtitle}</p>}
      </div>
    </header>
  );
}
