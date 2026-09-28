import { useEffect, useRef, useState } from 'react';

// How often to re-check for a new deploy while the tab is open and visible.
// Kept fairly infrequent — the meaningful checks are on regaining focus
// (below), which catches "closed the app, someone shipped an update,
// reopened it" almost instantly.
const POLL_INTERVAL_MS = 5 * 60 * 1000;

async function fetchVersion(): Promise<string | null> {
  try {
    // cache: 'no-store' so this never reads a browser- or CDN-cached copy —
    // it needs to see the version that's actually live right now.
    const res = await fetch('/version.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.version === 'string' ? data.version : null;
  } catch {
    return null;
  }
}

/**
 * Detects when a new build has been deployed (a fresh public/version.json,
 * stamped by scripts/write-version.mjs on every `npm run build`) and
 * refreshes the page automatically so everyone picks up app updates without
 * reinstalling, clearing anything, or even knowing to check.
 *
 * This only ever reloads the static app shell — it has nothing to do with
 * the Supabase database. Every session, friend, and profile lives there,
 * completely separate from this app code, so nothing is lost by refreshing.
 */
export default function UpdateWatcher() {
  const knownVersion = useRef<string | null>(null);
  const updatingRef = useRef(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchVersion().then((v) => {
      if (!cancelled) knownVersion.current = v;
    });

    const check = async () => {
      if (updatingRef.current) return;
      const v = await fetchVersion();
      if (!v || !knownVersion.current) return;
      if (v !== knownVersion.current) {
        updatingRef.current = true;
        setShowBanner(true);
        // Brief pause so the banner is actually visible before the reload,
        // rather than an instant jarring flash.
        setTimeout(() => window.location.reload(), 1200);
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') check();
    }, POLL_INTERVAL_MS);

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className="safe-top fixed inset-x-0 top-0 z-[60] flex items-center justify-center bg-lime px-4 py-2 text-xs font-bold text-void">
      New version available — updating…
    </div>
  );
}
