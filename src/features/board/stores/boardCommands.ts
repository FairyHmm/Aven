import { ghostOut } from "../../../shared/lib/dnd/glide";
import { archiveCard, placeCard, restoreCard } from "../lib/archive";
import { addAttachment, removeAttachment } from "../lib/attachments";
import { archiveColumnCards, sortColumn } from "../lib/columnOps";
import { duplicateCard } from "../lib/duplicate";
import { renameTag } from "../lib/labels/renameTag";
import * as ops from "../lib/mutations";
import { rewriteValues } from "../lib/props/dropdowns";
import { resizeCard, resizeColumn } from "../lib/resize";
import type { BoardData, BoardPatch } from "../lib/types";
import type { BoardActions } from "./boardTypes";

// How a change shows in the history.
export type Change = {
  // Names the step ("Delete card").
  label: string;
  // Changes with the same key, close together, are one step.
  key?: string;
  // Say what happened, with the way back ("Card deleted · Undo"): the words,
  // or made from the change (nothing, if it was not worth saying).
  notify?: string | ((patch: BoardPatch) => string | undefined);
  // False for what really happened outside the board (a file uploaded).
  remember?: boolean;
  // What moved flies to its new place above the board, rather than gliding
  // in place (a move made by key; a drag lands with its own picture).
  fly?: boolean;
};

export type Commit = (
  build: (data: BoardData) => BoardPatch,
  change: Change,
) => void;

// The actions that change columns and cards: each builds its patch from the
// board as it is and hands it to `commit`, which applies, remembers and saves.
export type EditActions = Omit<
  BoardActions,
  | "load"
  | "unload"
  | "setCanEdit"
  | "dismissError"
  | "dismissNotice"
  | "undo"
  | "redo"
>;

export function editActions(commit: Commit): EditActions {
  return {
    addColumn: name => {
      commit(data => ops.addColumn(data, name), { label: "Add column" });
    },
    renameColumn: (id, name) => {
      commit(data => ops.renameColumn(data, id, name), {
        label: "Rename column",
        key: `column:${id}`,
      });
    },
    recolorColumn: (id, accent) => {
      commit(data => ops.recolorColumn(data, id, accent), {
        label: "Colour column",
        key: `column:${id}`,
      });
    },
    resizeColumn: (id, width) => {
      commit(data => resizeColumn(data, id, width), {
        label: "Resize column",
        key: `resize:${id}`,
      });
    },
    resizeCard: (id, height) => {
      commit(data => resizeCard(data, id, height), {
        label: "Resize card",
        key: `resize:${id}`,
      });
    },
    removeColumn: id => {
      ghostOut(`column:${id}`);
      commit(data => ops.removeColumn(data, id), {
        label: "Delete column",
        notify: "Column deleted",
      });
    },
    sortColumn: (id, by) => {
      commit(data => sortColumn(data, id, by), { label: "Sort cards" });
    },
    archiveColumnCards: id => {
      commit(data => archiveColumnCards(data, id), {
        label: "Archive cards",
        notify: patch => `${patch.cards.length} cards archived`,
      });
    },
    addCard: (columnId, text) => {
      commit(data => ops.addCard(data, columnId, text), {
        label: "Add card",
      });
    },
    editCard: (id, changes) => {
      commit(data => ops.editCard(data, id, changes), {
        label: "Edit card",
        key: `card:${id}`,
      });
    },
    removeCard: id => {
      ghostOut(`card:${id}`);
      commit(() => ops.removeCard(id), {
        label: "Delete card",
        notify: "Card deleted",
      });
    },
    archiveCard: id => {
      ghostOut(`card:${id}`);
      commit(data => archiveCard(data, id), {
        label: "Archive card",
        notify: "Card archived",
      });
    },
    restoreCard: id => {
      commit(data => restoreCard(data, id), { label: "Restore card" });
    },
    duplicateCard: id => {
      commit(data => duplicateCard(data, id), { label: "Copy card" });
    },
    addAttachment: (cardId, attachment) => {
      commit(data => addAttachment(data, cardId, attachment), {
        label: "Attach file",
        remember: false,
      });
    },
    removeAttachment: (cardId, attachmentId) => {
      commit(data => removeAttachment(data, cardId, attachmentId), {
        label: "Remove file",
        remember: false,
      });
    },
    renameTag: (from, to) => {
      commit(data => renameTag(data, from, to), { label: "Rename tag" });
    },
    rewriteValues: (fields, from, to) => {
      commit(data => rewriteValues(data, fields, from, to), {
        label: "Rename option",
      });
    },
    moveCard: (id, toColumnId, index) => {
      // The archive is a list like the columns: a card moved onto it is
      // archived, one moved out of it is restored.
      commit(data => placeCard(data, id, toColumnId, index), {
        label: "Move card",
        fly: true,
        notify: patch =>
          patch.cards.some(card => card.archivedAt !== undefined)
            ? "Card archived"
            : undefined,
      });
    },
    moveColumn: (id, index) => {
      commit(data => ops.moveColumn(data, id, index), {
        label: "Move column",
        fly: true,
      });
    },
  };
}
