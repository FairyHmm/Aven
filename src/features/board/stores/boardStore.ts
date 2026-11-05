import { create } from "zustand";

import { captureLayout, markLoaded } from "../../../shared/lib/dnd/flip";
import * as ops from "../lib/mutations";
import { applyPatch, fullPatch, isEmptyPatch } from "../lib/patch";
import { seedBoard } from "../lib/seed";
import type { Accent, BoardData, BoardPatch, BoardRef } from "../lib/types";
import { storage } from "./storage";

export type BoardActions = {
  load: (ref: BoardRef) => Promise<void>;
  dismissError: () => void;
  addColumn: (name: string) => void;
  renameColumn: (id: string, name: string) => void;
  recolorColumn: (id: string, accent: Accent) => void;
  removeColumn: (id: string) => void;
  addCard: (columnId: string, text: string) => void;
  editCard: (id: string, changes: { title: string; body: string }) => void;
  removeCard: (id: string) => void;
  moveCard: (id: string, toColumnId: string, index: number) => void;
  moveColumn: (id: string, index: number) => void;
};

type BoardState = BoardData & {
  ref: BoardRef | undefined;
  status: "loading" | "ready";
  pending: number; // writes in flight
  error: string | undefined;
  actions: BoardActions;
};

let loadToken = 0; // discards results of superseded loads
let writeQueue: Promise<void> = Promise.resolve(); // keeps writes in order

function describe(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return /permission|insufficient/i.test(message)
    ? "Firebase refused the request: the committed Firestore rules deny all access and sign-in isn't wired up yet."
    : message;
}

export const useBoardStore = create<BoardState>()((set, get) => {
  const persist = (ref: BoardRef, patch: BoardPatch) => {
    set(state => ({ pending: state.pending + 1 }));
    writeQueue = writeQueue
      .then(() => storage.apply(ref, patch))
      .catch((error: unknown) => {
        set({ error: `Not saved. ${describe(error)}` });
      })
      .finally(() => {
        set(state => ({ pending: state.pending - 1 }));
      });
  };

  // Every mutation: update memory immediately, then write behind.
  const commit = (build: (data: BoardData) => BoardPatch) => {
    const { ref, columns, cards } = get();
    const patch = build({ columns, cards });
    if (ref === undefined || isEmptyPatch(patch)) {
      return;
    }
    captureLayout(); // for the FLIP glide, see shared/lib/dnd/flip.ts
    set(applyPatch({ columns, cards }, patch));
    persist(ref, patch);
  };

  const actions: BoardActions = {
    load: async ref => {
      loadToken += 1;
      const token = loadToken;
      set({ ref, status: "loading", columns: [], cards: [], error: undefined });
      try {
        const stored = await storage.load(ref);
        if (token !== loadToken) {
          return;
        }
        const data = stored ?? seedBoard();
        if (stored === undefined) {
          await storage.apply(ref, fullPatch(data));
        }
        if (token === loadToken) {
          markLoaded();
          set({ ...data, status: "ready" });
        }
      } catch (error: unknown) {
        if (token === loadToken) {
          set({ status: "ready", error: describe(error) });
        }
      }
    },

    dismissError: () => {
      set({ error: undefined });
    },
    addColumn: name => {
      commit(data => ops.addColumn(data, name));
    },
    renameColumn: (id, name) => {
      commit(data => ops.renameColumn(data, id, name));
    },
    recolorColumn: (id, accent) => {
      commit(data => ops.recolorColumn(data, id, accent));
    },
    removeColumn: id => {
      commit(data => ops.removeColumn(data, id));
    },
    addCard: (columnId, text) => {
      commit(data => ops.addCard(data, columnId, text));
    },
    editCard: (id, changes) => {
      commit(data => ops.editCard(data, id, changes));
    },
    removeCard: id => {
      commit(() => ops.removeCard(id));
    },
    moveCard: (id, toColumnId, index) => {
      commit(data => ops.moveCard(data, id, toColumnId, index));
    },
    moveColumn: (id, index) => {
      commit(data => ops.moveColumn(data, id, index));
    },
  };

  return {
    columns: [],
    cards: [],
    ref: undefined,
    status: "loading",
    pending: 0,
    error: undefined,
    actions,
  };
});
