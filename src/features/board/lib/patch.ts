import type { BoardData, BoardPatch } from "./types";

export function patchOf(partial: Partial<BoardPatch> = {}): BoardPatch {
  return {
    columns: [],
    cards: [],
    removeColumns: [],
    removeCards: [],
    ...partial,
  };
}

// Everything in `data` as upserts — used to seed or migrate a backend.
export function fullPatch(data: BoardData): BoardPatch {
  return patchOf({ columns: data.columns, cards: data.cards });
}

export function isEmptyPatch(patch: BoardPatch): boolean {
  return (
    patch.columns.length === 0 &&
    patch.cards.length === 0 &&
    patch.removeColumns.length === 0 &&
    patch.removeCards.length === 0
  );
}

function merge<T extends { id: string }>(
  current: readonly T[],
  upserts: readonly T[],
  drop: ReadonlySet<string>,
): T[] {
  const next = new Map<string, T>();
  for (const item of current) {
    next.set(item.id, item);
  }
  for (const item of upserts) {
    next.set(item.id, item);
  }
  for (const id of drop) {
    next.delete(id);
  }
  return [...next.values()];
}

export function applyPatch(data: BoardData, patch: BoardPatch): BoardData {
  return {
    columns: merge(data.columns, patch.columns, new Set(patch.removeColumns)),
    cards: merge(data.cards, patch.cards, new Set(patch.removeCards)),
  };
}
