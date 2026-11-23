import { patchOf } from "./patch";
import type { BoardData, BoardPatch } from "./types";

// Undo and redo. A change is a BoardPatch, so the way back is the patch that
// puts every touched column and card as it was.

export type HistoryEntry = {
  // What the change was, for the toast ("Delete card").
  label: string;
  undo: BoardPatch;
  redo: BoardPatch;
  // Changes with the same key, close in time, are one step (typing in a card,
  // dragging a resize handle).
  key: string | undefined;
  at: number;
};

export type History = { undo: HistoryEntry[]; redo: HistoryEntry[] };

export const NO_HISTORY: History = { undo: [], redo: [] };

// Steps kept; the oldest go first.
export const HISTORY_SIZE = 100;
// Changes this close with the same key are merged into one step.
export const MERGE_WITHIN_MS = 1500;

function pick<T extends { id: string }>(
  before: readonly T[],
  touched: Set<string>,
): T[] {
  return before.filter(item => touched.has(item.id));
}

// What puts `before` back after `patch` was applied to it: what existed and
// was changed or removed comes back as it was, what the patch created goes.
export function invertPatch(before: BoardData, patch: BoardPatch): BoardPatch {
  const columns = new Set(before.columns.map(item => item.id));
  const cards = new Set(before.cards.map(item => item.id));
  return patchOf({
    columns: pick(
      before.columns,
      new Set([...patch.columns.map(item => item.id), ...patch.removeColumns]),
    ),
    cards: pick(
      before.cards,
      new Set([...patch.cards.map(item => item.id), ...patch.removeCards]),
    ),
    removeColumns: patch.columns
      .map(item => item.id)
      .filter(id => !columns.has(id)),
    removeCards: patch.cards.map(item => item.id).filter(id => !cards.has(id)),
  });
}

// A new step on top of the undo stack. A change to what the last step changed,
// soon after it, joins that step: undoing it goes back to before both.
export function record(history: History, entry: HistoryEntry): History {
  const last = history.undo.at(-1);
  const joins =
    last !== undefined &&
    entry.key !== undefined &&
    last.key === entry.key &&
    entry.at - last.at < MERGE_WITHIN_MS;
  const undo = joins
    ? [
        ...history.undo.slice(0, -1),
        { ...last, redo: entry.redo, at: entry.at },
      ]
    : [...history.undo, entry];
  return { undo: undo.slice(-HISTORY_SIZE), redo: [] };
}

// Moves the last undo step onto the redo stack.
export function stepBack(history: History): History {
  const entry = history.undo.at(-1);
  return entry === undefined
    ? history
    : { undo: history.undo.slice(0, -1), redo: [...history.redo, entry] };
}

// Moves the last redo step back onto the undo stack.
export function stepForward(history: History): History {
  const entry = history.redo.at(-1);
  return entry === undefined
    ? history
    : { undo: [...history.undo, entry], redo: history.redo.slice(0, -1) };
}

// A card that is put back as it was keeps the files attached to it now:
// uploading or deleting a file really happened, whatever the history says.
// (A card that is not on the board comes back with its own files.)
export function keepAttachments(
  patch: BoardPatch,
  current: BoardData,
): BoardPatch {
  const here = new Map(current.cards.map(card => [card.id, card.attachments]));
  return {
    ...patch,
    cards: patch.cards.map(card => {
      if (!here.has(card.id)) {
        return card;
      }
      const { attachments: _before, ...rest } = card;
      const attachments = here.get(card.id);
      return attachments === undefined ? rest : { ...rest, attachments };
    }),
  };
}
