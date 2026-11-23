import { create } from "zustand";

import { captureLayout, flyNext } from "../../../shared/lib/dnd/flip";
import {
  invertPatch,
  keepAttachments,
  NO_HISTORY,
  record,
  stepBack,
  stepForward,
} from "../lib/history";
import { applyPatch, isEmptyPatch } from "../lib/patch";
import type { BoardPatch, BoardRef } from "../lib/types";
import { type Change, type Commit, editActions } from "./boardCommands";
import { describeBoardError, subscribeBoard } from "./boardSync";
import type { BoardActions, BoardState, Notice } from "./boardTypes";
import { ghostRemoved } from "./ghostRemoved";
import { storage } from "./storage";

export type { BoardActions, BoardState, Notice } from "./boardTypes";

// The cards and columns a change is about, to fly to their new places.
const flightsOf = (patch: BoardPatch) => [
  ...patch.cards.map(card => `card:${card.id}`),
  ...patch.columns.map(column => `column:${column.id}`),
];

// What a change says for itself, with the way back, if it says anything.
function noticeOf(change: Change, patch: BoardPatch): Notice | undefined {
  const text =
    typeof change.notify === "function" ? change.notify(patch) : change.notify;
  return text === undefined
    ? undefined
    : { id: (noticeId += 1), text, action: "undo" };
}

let loadToken = 0;
let noticeId = 0;
let stopSubscription: (() => void) | undefined;
let writeQueue: Promise<void> = Promise.resolve();

export const useBoardStore = create<BoardState>()((set, get) => {
  const persist = (ref: BoardRef, patch: BoardPatch) => {
    if (!get().canEdit) {
      return;
    }
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

  const commit: Commit = (build, change) => {
    const { ref, columns, cards, canEdit, history } = get();
    if (!canEdit) {
      return;
    }
    const data = { columns, cards };
    const patch = build(data);
    if (ref === undefined || isEmptyPatch(patch)) {
      return;
    }
    captureLayout();
    if (change.fly === true) {
      flyNext(flightsOf(patch));
    }
    set({
      ...applyPatch(data, patch),
      ...(change.remember === false
        ? {}
        : {
            history: record(history, {
              label: change.label,
              undo: invertPatch(data, patch),
              redo: patch,
              key: change.key,
              at: Date.now(),
            }),
          }),
      // Any other change makes an old "Undo" mean the wrong step: it goes.
      notice: noticeOf(change, patch),
    });
    persist(ref, patch);
  };

  // Undo takes the last step back; redo plays it again.
  const step = (way: "undo" | "redo") => {
    const { ref, columns, cards, canEdit, history } = get();
    const entry = history[way].at(-1);
    if (!canEdit || ref === undefined || entry === undefined) {
      return;
    }
    const data = { columns, cards };
    const patch = keepAttachments(entry[way], data);
    ghostRemoved(data, patch);
    captureLayout();
    flyNext(flightsOf(patch));
    set({
      ...applyPatch(data, patch),
      history: way === "undo" ? stepBack(history) : stepForward(history),
      notice: {
        id: (noticeId += 1),
        text: `${way === "undo" ? "Undid" : "Redid"} “${entry.label.toLowerCase()}”`,
        action: way === "undo" ? "redo" : "undo",
      },
    });
    persist(ref, patch);
  };

  const actions: BoardActions = {
    ...editActions(commit),
    load: ref => {
      loadToken += 1;
      const token = loadToken;
      stopSubscription?.();
      set({
        ref,
        status: "loading",
        columns: [],
        cards: [],
        error: undefined,
        history: NO_HISTORY,
        notice: undefined,
      });
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
    setCanEdit: canEdit => {
      set({ canEdit });
    },
    dismissError: () => {
      set({ error: undefined });
    },
    dismissNotice: () => {
      set({ notice: undefined });
    },
    undo: () => {
      step("undo");
    },
    redo: () => {
      step("redo");
    },
  };

  return {
    ref: undefined,
    columns: [],
    cards: [],
    status: "loading",
    pending: 0,
    error: undefined,
    canEdit: false,
    history: NO_HISTORY,
    notice: undefined,
    actions,
  };
});
