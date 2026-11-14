import { generateKeyBetween } from "fractional-indexing";

type Ordered = { id: string; order: string };

export function byOrder(a: Ordered, b: Ordered): number {
  if (a.order !== b.order) {
    return a.order < b.order ? -1 : 1;
  }
  if (a.id === b.id) {
    return 0;
  }
  return a.id < b.id ? -1 : 1;
}

// Order key that places a new item at `index` in an already sorted list.
export function keyAtIndex(
  sorted: readonly { order: string }[],
  index: number,
): string {
  const at = Math.max(0, Math.min(index, sorted.length));
  const before = at > 0 ? sorted[at - 1] : undefined;
  const after = at < sorted.length ? sorted[at] : undefined;
  try {
    return generateKeyBetween(before?.order ?? null, after?.order ?? null);
  } catch {
    // Corrupt or duplicate keys: fall back to appending.
    return generateKeyBetween(sorted.at(-1)?.order ?? null, null);
  }
}
