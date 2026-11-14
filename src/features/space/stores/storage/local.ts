import { newId } from "../../../../shared/lib/id";
import type { Board, Space } from "../../lib/types";
import {
  boardsKey,
  readAllSpaces,
  readSpaceBoards,
  readUserSpaces,
  SPACES_KEY,
  writeJson,
} from "./localSeed";
import type { SpaceStorage } from "./types";

const spaceListeners = new Set<() => void>();
const boardListeners = new Map<string, Set<() => void>>();

function notifySpaces(): void {
  for (const listener of spaceListeners) listener();
}

function notifyBoards(spaceId: string): void {
  const listeners = boardListeners.get(spaceId);
  if (listeners === undefined) return;
  for (const listener of listeners) listener();
}

function updateSpace(spaceId: string, patch: (space: Space) => Space): void {
  const all = readAllSpaces() ?? [];
  writeJson(
    SPACES_KEY,
    all.map(item => (item.id === spaceId ? patch(item) : item)),
  );
  notifySpaces();
}

export const localSpaceStorage: SpaceStorage = {
  subscribeSpaces: (uid, onData) => {
    const push = () => {
      onData(readUserSpaces(uid));
    };
    spaceListeners.add(push);
    push();
    return () => {
      spaceListeners.delete(push);
    };
  },
  subscribeBoards: (spaceId, onData) => {
    const push = () => {
      onData(readSpaceBoards(spaceId));
    };
    const set = boardListeners.get(spaceId) ?? new Set<() => void>();
    set.add(push);
    boardListeners.set(spaceId, set);
    push();
    return () => {
      set.delete(push);
    };
  },
  createSpace: async (name, owner) => {
    const now = Date.now();
    const id = newId();
    const space: Space = {
      id,
      name: name.trim() || "Untitled space",
      ownerId: owner.uid,
      memberIds: [owner.uid],
      members: { [owner.uid]: { ...owner, role: "owner", addedAt: now } },
      createdAt: now,
      updatedAt: now,
    };
    writeJson(SPACES_KEY, [...(readAllSpaces() ?? []), space]);
    writeJson(boardsKey(id), [
      {
        id: newId(),
        spaceId: id,
        name: "Board 1",
        order: "a0",
        createdAt: now,
        updatedAt: now,
      },
    ] satisfies Board[]);
    notifySpaces();
    return space;
  },
  renameSpace: async (spaceId, name) => {
    updateSpace(spaceId, s => ({
      ...s,
      name: name.trim() || s.name,
      updatedAt: Date.now(),
    }));
  },
  deleteSpace: async spaceId => {
    writeJson(
      SPACES_KEY,
      (readAllSpaces() ?? []).filter(item => item.id !== spaceId),
    );
    localStorage.removeItem(boardsKey(spaceId));
    notifySpaces();
  },
  createBoard: async (spaceId, name, order) => {
    const now = Date.now();
    const board: Board = {
      id: newId(),
      spaceId,
      name: name.trim() || "Untitled board",
      order,
      createdAt: now,
      updatedAt: now,
    };
    writeJson(boardsKey(spaceId), [...readSpaceBoards(spaceId), board]);
    notifyBoards(spaceId);
    return board;
  },
  renameBoard: async (spaceId, boardId, name) => {
    const next = readSpaceBoards(spaceId).map(b =>
      b.id === boardId
        ? { ...b, name: name.trim() || b.name, updatedAt: Date.now() }
        : b,
    );
    writeJson(boardsKey(spaceId), next);
    notifyBoards(spaceId);
  },
  deleteBoard: async (spaceId, boardId) => {
    writeJson(
      boardsKey(spaceId),
      readSpaceBoards(spaceId).filter(b => b.id !== boardId),
    );
    localStorage.removeItem(`aven:v1:board:${spaceId}:${boardId}`);
    notifyBoards(spaceId);
  },
  reorderBoard: async (spaceId, boardId, order) => {
    const next = readSpaceBoards(spaceId).map(b =>
      b.id === boardId ? { ...b, order, updatedAt: Date.now() } : b,
    );
    writeJson(boardsKey(spaceId), next);
    notifyBoards(spaceId);
  },
  findUserByEmail: async email => {
    const clean = email.trim().toLowerCase();
    if (clean === "") return undefined;
    return {
      uid: `local:${clean}`,
      email: clean,
      displayName: clean.split("@")[0] ?? clean,
      photoURL: null,
    };
  },
  addMember: async (spaceId, member) => {
    updateSpace(spaceId, s => ({
      ...s,
      memberIds: s.memberIds.includes(member.uid)
        ? s.memberIds
        : [...s.memberIds, member.uid],
      members: { ...s.members, [member.uid]: member },
      updatedAt: Date.now(),
    }));
  },
  updateMemberRole: async (spaceId, uid, role) => {
    updateSpace(spaceId, s => {
      const target = s.members[uid];
      if (target === undefined) return s;
      return {
        ...s,
        members: { ...s.members, [uid]: { ...target, role } },
        updatedAt: Date.now(),
      };
    });
  },
  removeMember: async (spaceId, uid) => {
    updateSpace(spaceId, s => {
      const { [uid]: _, ...rest } = s.members;
      return {
        ...s,
        memberIds: s.memberIds.filter(id => id !== uid),
        members: rest,
        updatedAt: Date.now(),
      };
    });
  },
  saveSettings: async (spaceId, patch) => {
    updateSpace(spaceId, s => ({ ...s, ...patch, updatedAt: Date.now() }));
  },
};
