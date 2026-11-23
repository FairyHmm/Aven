import type { SortBy } from "../lib/columnOps";
import type { History } from "../lib/history";
import type {
  Accent,
  Attachment,
  BoardData,
  BoardRef,
  Props,
} from "../lib/types";

export type BoardActions = {
  load: (ref: BoardRef) => void;
  unload: () => void;
  // Set from the person's role in the space; until it is, nothing can change.
  setCanEdit: (canEdit: boolean) => void;
  dismissError: () => void;
  dismissNotice: () => void;
  // Step back through (or forward again over) the person's own changes.
  undo: () => void;
  redo: () => void;
  addColumn: (name: string) => void;
  renameColumn: (id: string, name: string) => void;
  recolorColumn: (id: string, accent: Accent) => void;
  // undefined = the default size.
  resizeColumn: (id: string, width: number | undefined) => void;
  resizeCard: (id: string, height: number | undefined) => void;
  removeColumn: (id: string) => void;
  // Lay a column's cards out in an order, or set them all aside.
  sortColumn: (id: string, by: SortBy) => void;
  archiveColumnCards: (id: string) => void;
  addCard: (columnId: string, text: string) => void;
  editCard: (
    id: string,
    changes: { title: string; body: string; props?: Props | undefined },
  ) => void;
  removeCard: (id: string) => void;
  archiveCard: (id: string) => void;
  restoreCard: (id: string) => void;
  duplicateCard: (id: string) => void;
  addAttachment: (cardId: string, attachment: Attachment) => void;
  removeAttachment: (cardId: string, attachmentId: string) => void;
  renameTag: (from: string, to: string) => void;
  rewriteValues: (fields: string[], from: string, to: string) => void;
  moveCard: (id: string, toColumnId: string, index: number) => void;
  moveColumn: (id: string, index: number) => void;
};

// A line shown at the foot of the board after something that is easy to
// regret, with the way back: "Card deleted · Undo".
export type Notice = {
  id: number;
  text: string;
  action: "undo" | "redo";
};

export type BoardState = BoardData & {
  ref: BoardRef | undefined;
  status: "loading" | "ready";
  pending: number;
  error: string | undefined;
  // False for viewers: every write is ignored, whatever the screen offers.
  canEdit: boolean;
  history: History;
  notice: Notice | undefined;
  actions: BoardActions;
};
