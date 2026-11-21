import { byOrder } from "../../../../shared/lib/order";
import type { Board, Space } from "../../lib/types";
import { toBoard, toSpace } from "./parse";

export const SPACES_KEY = "aven:v1:spaces";
export const boardsKey = (spaceId: string) => `aven:v1:boards:${spaceId}`;

export function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function parseList(key: string): Record<string, unknown>[] | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    return parsed
      .filter(
        (item): item is object => typeof item === "object" && item !== null,
      )
      .map(item => Object.fromEntries(Object.entries(item)));
  } catch {
    return undefined;
  }
}

export function readAllSpaces(): Space[] | undefined {
  const rows = parseList(SPACES_KEY);
  return rows?.map(row =>
    toSpace(typeof row.id === "string" ? row.id : "", row),
  );
}

export function readUserSpaces(uid: string): Space[] {
  // No demo spaces: like Firebase, a new account starts with none.
  const all = readAllSpaces() ?? [];
  return all.filter(space => space.memberIds.includes(uid));
}

export function readSpaceBoards(spaceId: string): Board[] {
  const rows = parseList(boardsKey(spaceId));
  if (rows === undefined) return [];
  return rows
    .map(row => toBoard(spaceId, typeof row.id === "string" ? row.id : "", row))
    .sort(byOrder);
}
