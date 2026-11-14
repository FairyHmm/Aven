import { create } from "zustand";

import { captureLayout } from "../../../shared/lib/dnd/flip";
import { ghostOut } from "../../../shared/lib/dnd/glide";
import { addAttachment, removeAttachment } from "../lib/attachments";
import { duplicateCard } from "../lib/duplicate";
import { renameTag } from "../lib/labels/renameTag";
import * as ops from "../lib/mutations";
import { applyPatch, isEmptyPatch } from "../lib/patch";
import { rewriteValues } from "../lib/props/dropdowns";
import type {
  Accent,
  Attachment,
  BoardData,
  BoardPatch,
  BoardRef,
  Props,
} from "../lib/types";
import { describeBoardError, subscribeBoard } from "./boardSync";
import { storage } from "./storage";

export type BoardActions = {
  load: (ref: BoardRef) => void;
  unload: () => void;
  dismissError: () => void;
  addColumn: (name: string) => void;
  renameColumn: (id: string, name: string) => void;
  recolorColumn: (id: string, accent: Accent) => void;
  removeColumn: (id: string) => void;
  addCard: (columnId: string, text: string) => void;
  editCard: (
    id: string,
    changes: { title: string; body: string; props?: Props | undefined },
  ) => void;
  removeCard: (id: string) => void;
  duplicateCard: (id: string) => void;
  addAttachment: (cardId: string, attachment: Attachment) => void;
  removeAttachment: (cardId: string, attachmentId: string) => void;
  renameTag: (from: string, to: string) => void;
  rewriteValues: (fields: string[], from: string, to: string) => void;
  moveCard: (id: string, toColumnId: string, index: number) => void;
  moveColumn: (id: string, index: number) => void;
};

type BoardState = BoardData & {
  ref: BoardRef | undefined;
  status: "loading" | "ready";
  pending: number;
  error: string | undefined;
  actions: BoardActions;
};

let loadToken = 0;
let stopSubscription: (() => void) | undefined;
let writeQueue: Promise<void> = Promise.resolve();

export const useBoardStore = create<BoardState>()((set, get) => {
  const persist = (ref: BoardRef, patch: BoardPatch) => {
    set(state => ({ pending: state.pending + 1 }));
    writeQueue = writeQueue
      .then(() => storage.apply(ref, patch))
      .catch((error: unknown) => {
        set({ error: `Not saved. ${describeBoardError(error)}` });
      })
      .finally(() => {
        set(state => ({ pending: state.pending - 1 }));
      });
  };

  const commit = (build: (data: BoardData) => BoardPatch) => {
    const { ref, columns, cards } = get();
    const patch = build({ columns, cards });
    if (ref === undefined || isEmptyPatch(patch)) {
      return;
    }
    captureLayout();
    set(applyPatch({ columns, cards }, patch));
    persist(ref, patch);
  };

  const actions: BoardActions = {
    load: ref => {
      loadToken += 1;
      const token = loadToken;
      stopSubscription?.();
      set({ ref, status: "loading", columns: [], cards: [], error: undefined });
      stopSubscription = subscribeBoard(
        ref,
        () => token === loadToken,
        patch => {
          set(patch);
        },
        persist,
      );
    },
    unload: () => {
      loadToken += 1;
      stopSubscription?.();
      stopSubscription = undefined;
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
      ghostOut(`column:${id}`);
      commit(data => ops.removeColumn(data, id));
    },
    addCard: (columnId, text) => {
      commit(data => ops.addCard(data, columnId, text));
    },
    editCard: (id, changes) => {
      commit(data => ops.editCard(data, id, changes));
    },
    removeCard: id => {
      ghostOut(`card:${id}`);
      commit(() => ops.removeCard(id));
    },
    duplicateCard: id => {
      commit(data => duplicateCard(data, id));
    },
    addAttachment: (cardId, attachment) => {
      commit(data => addAttachment(data, cardId, attachment));
    },
    removeAttachment: (cardId, attachmentId) => {
      commit(data => removeAttachment(data, cardId, attachmentId));
    },
    renameTag: (from, to) => {
      commit(data => renameTag(data, from, to));
    },
    rewriteValues: (fields, from, to) => {
      commit(data => rewriteValues(data, fields, from, to));
    },
    moveCard: (id, toColumnId, index) => {
      commit(data => ops.moveCard(data, id, toColumnId, index));
    },
    moveColumn: (id, index) => {
      commit(data => ops.moveColumn(data, id, index));
    },
  };

  return {
    ref: undefined,
    columns: [],
    cards: [],
    status: "loading",
    pending: 0,
    error: undefined,
    actions,
  };
});
