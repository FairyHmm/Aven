import type { DocumentData } from "firebase/firestore";

import type {
  Board,
  Space,
  SpaceFieldConfig,
  SpaceMember,
  SpaceRole,
  SpaceTagColors,
} from "../../lib/types";

const text = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;
const num = (v: unknown, fallback = 0): number =>
  typeof v === "number" ? v : fallback;
const record = (v: unknown): Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v)
    ? Object.fromEntries(Object.entries(v))
    : {};

function toRole(v: unknown): SpaceRole {
  return v === "owner" || v === "editor" || v === "viewer" ? v : "viewer";
}

function toMembers(raw: unknown): Record<string, SpaceMember> {
  const out: Record<string, SpaceMember> = {};
  for (const [uid, value] of Object.entries(record(raw))) {
    const entry = record(value);
    out[uid] = {
      uid: text(entry.uid, uid),
      email: text(entry.email),
      displayName: text(entry.displayName, "User"),
      photoURL: typeof entry.photoURL === "string" ? entry.photoURL : null,
      role: toRole(entry.role),
      addedAt: num(entry.addedAt),
    };
  }
  return out;
}

function toTagColors(raw: unknown): SpaceTagColors | undefined {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return undefined;
  }
  const out: SpaceTagColors = {};
  for (const [k, v] of Object.entries(record(raw))) {
    if (typeof v === "string") {
      out[k] = v;
    }
  }
  return out;
}

function toFieldConfig(raw: unknown): SpaceFieldConfig | undefined {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return undefined;
  }
  const obj = record(raw);
  const lists: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(record(obj.lists))) {
    if (Array.isArray(v)) {
      lists[k] = v.filter((item): item is string => typeof item === "string");
    }
  }
  const links: Record<string, string> = {};
  for (const [k, v] of Object.entries(record(obj.links))) {
    if (typeof v === "string") {
      links[k] = v;
    }
  }
  const colors: Record<string, Record<string, string>> = {};
  for (const [list, map] of Object.entries(record(obj.colors))) {
    const inner: Record<string, string> = {};
    for (const [opt, col] of Object.entries(record(map))) {
      if (typeof col === "string") {
        inner[opt] = col;
      }
    }
    colors[list] = inner;
  }
  return { lists, links, colors };
}

export function toSpace(id: string, data: DocumentData): Space {
  const memberIds = Array.isArray(data.memberIds)
    ? data.memberIds.filter((item): item is string => typeof item === "string")
    : [];
  const tagColors = toTagColors(data.tagColors);
  const fieldConfig = toFieldConfig(data.fieldConfig);
  return {
    id,
    name: text(data.name, "Untitled space"),
    ownerId: text(data.ownerId),
    memberIds,
    members: toMembers(data.members),
    ...(tagColors !== undefined ? { tagColors } : {}),
    ...(fieldConfig !== undefined ? { fieldConfig } : {}),
    createdAt: num(data.createdAt),
    updatedAt: num(data.updatedAt),
  };
}

export function toBoard(
  spaceId: string,
  id: string,
  data: DocumentData,
): Board {
  return {
    id,
    spaceId,
    name: text(data.name, "Untitled board"),
    order: text(data.order, "a0"),
    createdAt: num(data.createdAt),
    updatedAt: num(data.updatedAt),
  };
}
