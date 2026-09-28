import type { OpenPlaySession } from '../types';

/** What each current participant owes, in JMD. 0 means free. */
export function costPerPerson(session: OpenPlaySession): number {
  if (session.isPrivate) {
    const total = session.totalCostJmd ?? 0;
    if (total <= 0) return 0;
    return Math.ceil(total / Math.max(1, session.joined.length));
  }
  return session.costPerPersonJmd ?? 0;
}

export function isFreeSession(session: OpenPlaySession): boolean {
  return costPerPerson(session) === 0;
}

/** Short display string for cards/lists, e.g. "FREE" or "$500 JMD / person". */
export function formatCost(session: OpenPlaySession): string {
  const per = costPerPerson(session);
  if (per === 0) return 'FREE';
  const suffix = session.isPrivate ? ' / person (split)' : ' / person';
  return `$${per.toLocaleString()} JMD${suffix}`;
}
