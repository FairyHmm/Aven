import { applyPatch } from "../../lib/patch";
import type { BoardData, BoardRef } from "../../lib/types";
import type { BoardStorage } from "./types";

// Whole board as one JSON blob per board, in the browser's localStorage.
const keyOf = (ref: BoardRef) => `aven:v1:board:${ref.spaceId}:${ref.boardId}`;

function isBoardData(value: unknown): value is BoardData {
  return (
    typeof value === "object" &&
    value !== null &&
    "columns" in value &&
    "cards" in value &&
    Array.isArray(value.columns) &&
    Array.isArray(value.cards)
  );
}

function read(ref: BoardRef): BoardData | undefined {
  const raw = localStorage.getItem(keyOf(ref));
  if (raw === null) {
    return undefined;
  }
  const parsed: unknown = JSON.parse(raw);
  return isBoardData(parsed) ? parsed : undefined;
}

export const localBoardStorage: BoardStorage = {
  load: async ref => read(ref),
  apply: async (ref, patch) => {
    const current = read(ref) ?? { columns: [], cards: [] };
    localStorage.setItem(
      keyOf(ref),
      JSON.stringify(applyPatch(current, patch)),
    );
  },
};
