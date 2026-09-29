// A DM thread needs one consistent id regardless of who opened it first —
// sorting the two participant ids and joining them gives both people the
// same key without either side having to "own" the conversation.
export function dmThreadId(a: string, b: string): string {
  return [a, b].sort().join('__');
}
