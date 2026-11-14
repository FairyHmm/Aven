import { create } from "zustand";

import { keyAtIndex } from "../../../shared/lib/order";
import type {
  Board,
  Space,
  SpaceFieldConfig,
  SpaceRole,
  SpaceTagColors,
  UserLookup,
} from "../lib/types";
import {
  clearSpaceSubscriptions,
  errMessage,
  inviteSpaceMember,
  reorderBoardList,
  unwatchSpaceBoards,
  watchSpaceBoards,
  watchUserSpaces,
} from "./spaceSync";
import { spaceStorage } from "./storage";

type SpaceState = {
  uid: string | undefined;
  spaces: Space[];
  spacesStatus: "idle" | "loading" | "ready";
  boardsBySpace: Record<string, Board[]>;
  boardsStatus: Record<string, "loading" | "ready">;
  error: string | undefined;
  watchSpaces: (uid: string | undefined) => void;
  watchBoards: (spaceId: string) => void;
  unwatchBoards: (spaceId: string) => void;
  dismissError: () => void;
  createSpace: (name: string, owner: UserLookup) => Promise<Space | undefined>;
  renameSpace: (spaceId: string, name: string) => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<void>;
  createBoard: (spaceId: string, name: string) => Promise<Board | undefined>;
  renameBoard: (
    spaceId: string,
    boardId: string,
    name: string,
  ) => Promise<void>;
  deleteBoard: (spaceId: string, boardId: string) => Promise<void>;
  moveBoard: (spaceId: string, boardId: string, index: number) => Promise<void>;
  inviteMember: (
    spaceId: string,
    email: string,
    role: SpaceRole,
  ) => Promise<string | undefined>;
  updateMemberRole: (
    spaceId: string,
    uid: string,
    role: SpaceRole,
  ) => Promise<void>;
  removeMember: (spaceId: string, uid: string) => Promise<void>;
  saveSettings: (
    spaceId: string,
    patch: { tagColors?: SpaceTagColors; fieldConfig?: SpaceFieldConfig },
  ) => Promise<void>;
};

export const useSpaceStore = create<SpaceState>()((set, get) => {
  const run = async (task: () => Promise<void>) => {
    try {
      await task();
    } catch (error: unknown) {
      set({ error: errMessage(error) });
    }
  };

  return {
    uid: undefined,
    spaces: [],
    spacesStatus: "idle",
    boardsBySpace: {},
    boardsStatus: {},
    error: undefined,

    watchSpaces: uid => {
      if (get().uid === uid && uid !== undefined) return;
      if (uid === undefined) {
        clearSpaceSubscriptions();
        set({
          uid: undefined,
          spaces: [],
          spacesStatus: "idle",
          boardsBySpace: {},
          boardsStatus: {},
        });
        return;
      }
      set({ uid, spacesStatus: "loading", error: undefined });
      watchUserSpaces(
        uid,
        spaces => {
          set({ spaces, spacesStatus: "ready" });
        },
        error => {
          set({ spacesStatus: "ready", error });
        },
      );
    },

    watchBoards: spaceId => {
      const started = watchSpaceBoards(
        spaceId,
        boards => {
          set(s => ({
            boardsBySpace: { ...s.boardsBySpace, [spaceId]: boards },
            boardsStatus: { ...s.boardsStatus, [spaceId]: "ready" },
          }));
        },
        error => {
          set(s => ({
            boardsStatus: { ...s.boardsStatus, [spaceId]: "ready" },
            error,
          }));
        },
      );
      if (started) {
        set(s => ({
          boardsStatus: { ...s.boardsStatus, [spaceId]: "loading" },
        }));
      }
    },

    unwatchBoards: unwatchSpaceBoards,
    dismissError: () => {
      set({ error: undefined });
    },

    createSpace: async (name, owner) => {
      try {
        return await spaceStorage.createSpace(name, owner);
      } catch (error: unknown) {
        set({ error: errMessage(error) });
        return undefined;
      }
    },
    renameSpace: (spaceId, name) =>
      run(() => spaceStorage.renameSpace(spaceId, name)),
    deleteSpace: spaceId => run(() => spaceStorage.deleteSpace(spaceId)),

    createBoard: async (spaceId, name) => {
      const list = get().boardsBySpace[spaceId] ?? [];
      const order = keyAtIndex(list, list.length);
      try {
        return await spaceStorage.createBoard(spaceId, name, order);
      } catch (error: unknown) {
        set({ error: errMessage(error) });
        return undefined;
      }
    },
    renameBoard: (spaceId, boardId, name) =>
      run(() => spaceStorage.renameBoard(spaceId, boardId, name)),
    deleteBoard: (spaceId, boardId) =>
      run(() => spaceStorage.deleteBoard(spaceId, boardId)),

    moveBoard: async (spaceId, boardId, index) => {
      const next = reorderBoardList(
        get().boardsBySpace[spaceId] ?? [],
        boardId,
        index,
      );
      if (next === undefined) return;
      set(s => ({
        boardsBySpace: { ...s.boardsBySpace, [spaceId]: next.boards },
      }));
      await run(() => spaceStorage.reorderBoard(spaceId, boardId, next.order));
    },

    inviteMember: inviteSpaceMember,
    updateMemberRole: (spaceId, uid, role) =>
      run(() => spaceStorage.updateMemberRole(spaceId, uid, role)),
    removeMember: (spaceId, uid) =>
      run(() => spaceStorage.removeMember(spaceId, uid)),
    saveSettings: (spaceId, patch) =>
      run(() => spaceStorage.saveSettings(spaceId, patch)),
  };
});
