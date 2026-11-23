import { create } from "zustand";

// Where the dragged item would land, for whichever list the pointer is over:
// the list, an index in its full item list (including the dragged item when it
// is the same list) and the room to open. One source of truth for both the
// "make room" preview and the actual drop, so what you see is what you get.
type DragState = {
  kind: string | undefined;
  listId: string | undefined;
  index: number;
  size: number;
  // Position of the dragged item in that same list, or -1 when it comes from
  // another list. It is lifted out of the layout while dragged.
  from: number;
  // Set while the pointer is over a "sink": a button that takes the dragged
  // item in (the archive button) rather than a list it would be placed in.
  sink: HTMLElement | undefined;
  setTarget: (
    kind: string,
    listId: string,
    index: number,
    size: number,
    from: number,
  ) => void;
  aimAtSink: (kind: string, listId: string, element: HTMLElement) => void;
  clearFrom: (kind: string, listId: string) => void;
  end: () => void;
};

const CLEARED = {
  kind: undefined,
  listId: undefined,
  index: -1,
  size: 0,
  from: -1,
  sink: undefined,
} as const;

export const useDragStore = create<DragState>()((set, get) => ({
  ...CLEARED,

  setTarget: (kind, listId, index, size, from) => {
    const state = get();
    if (
      state.kind !== kind ||
      state.listId !== listId ||
      state.index !== index ||
      state.size !== size ||
      state.from !== from
    ) {
      set({ kind, listId, index, size, from, sink: undefined });
    }
  },

  aimAtSink: (kind, listId, element) => {
    const state = get();
    if (
      state.kind !== kind ||
      state.listId !== listId ||
      state.sink !== element
    ) {
      set({ kind, listId, index: 0, size: 0, from: -1, sink: element });
    }
  },

  clearFrom: (kind, listId) => {
    const state = get();
    if (state.kind === kind && state.listId === listId) {
      set(CLEARED);
    }
  },

  // Close the gap instantly: the dropped item takes its place in the same
  // frame, so animating the gap shut would make its neighbours bounce.
  end: () => {
    document.body.dataset.dropping = "true";
    set(CLEARED);
    requestAnimationFrame(() => {
      document.body.removeAttribute("data-dropping");
    });
  },
}));
