import { byOrder } from "../../../../shared/lib/order";
import type { Board, Space, SpaceMember } from "../../lib/types";
import { toBoard, toSpace } from "./parse";

export const SPACES_KEY = "aven:v1:spaces";
export const boardsKey = (spaceId: string) => `aven:v1:boards:${spaceId}`;

export function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function seedLocalSpaces(ownerUid: string): Space[] {
  const now = Date.now();
  const owner: SpaceMember = {
    uid: ownerUid,
    email: "local@aven.app",
    displayName: "Local User",
    photoURL: null,
    role: "owner",
    addedAt: now,
  };
  const initial: Space[] = [
    {
      id: "it3120",
      name: "IT3120",
      ownerId: ownerUid,
      memberIds: [ownerUid],
      members: { [ownerUid]: owner },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "personal",
      name: "Personal",
      ownerId: ownerUid,
      memberIds: [ownerUid],
      members: { [ownerUid]: owner },
      createdAt: now,
      updatedAt: now,
    },
  ];
  writeJson(SPACES_KEY, initial);
  writeJson(boardsKey("it3120"), [
    {
      id: "roadmap",
      spaceId: "it3120",
      name: "Roadmap",
      order: "a0",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "research",
      spaceId: "it3120",
      name: "Research",
      order: "a1",
      createdAt: now,
      updatedAt: now,
    },
  ] satisfies Board[]);
  writeJson(boardsKey("personal"), [
    {
      id: "inbox",
      spaceId: "personal",
      name: "Inbox",
      order: "a0",
      createdAt: now,
      updatedAt: now,
    },
  ] satisfies Board[]);
  return initial;
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
  const all = readAllSpaces() ?? seedLocalSpaces(uid);
  return all.filter(space => space.memberIds.includes(uid));
}

export function readSpaceBoards(spaceId: string): Board[] {
  const rows = parseList(boardsKey(spaceId));
  if (rows === undefined) return [];
  return rows
    .map(row => toBoard(spaceId, typeof row.id === "string" ? row.id : "", row))
    .sort(byOrder);
}
