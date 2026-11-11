import { create } from "zustand";

import { captureAndGlide } from "../../../shared/lib/dnd/glide";
import type { PopupKind } from "../lib/types";

// Which card is open, and how. A click opens the card in the modal; the quick
// edit (pencil, `e`) turns the tile itself into the editor. The store lives
// outside the components so a tile can start either without the request being
// passed down through the columns.
type EditorState = {
  // The card shown in the modal.
  openId: string | undefined;
  // The card being edited in place.
  editingId: string | undefined;
  // The property popup open on the card being edited (opened by its hotkey
  // or by the quick-edit menu).
  popup: PopupKind | undefined;
  // The tile under the pointer, which `e` quick-edits.
  hoveredId: string | undefined;
  open: (id: string) => void;
  edit: (id: string, popup?: PopupKind) => void;
  setPopup: (popup: PopupKind | undefined) => void;
  hover: (id: string | undefined) => void;
  close: () => void;
};

// A tile that becomes an editor (or goes back) changes height: the cards
// under it glide to their new places instead of jumping.
export const useEditorStore = create<EditorState>()((set, get) => ({
  openId: undefined,
  editingId: undefined,
  popup: undefined,
  hoveredId: undefined,
  open: id => {
    if (get().editingId !== undefined) {
      captureAndGlide();
    }
    set({ openId: id, editingId: undefined, popup: undefined });
  },
  edit: (id, popup) => {
    captureAndGlide();
    set({ editingId: id, openId: undefined, popup });
  },
  setPopup: popup => {
    set({ popup });
  },
  hover: id => {
    set({ hoveredId: id });
  },
  close: () => {
    if (get().editingId !== undefined) {
      captureAndGlide();
    }
    set({ openId: undefined, editingId: undefined, popup: undefined });
  },
}));
