import { create } from "zustand";

// What the board is narrowed to: the tag (clicking a label), with everything
// beneath it, and/or some text typed in the filter box. Cards can't be dragged
// or moved by key while either is on: the drop position would be counted in a
// column that hides some of its cards.
type FilterState = {
  tag: string | undefined;
  text: string;
  show: (tag: string) => void;
  // Stops narrowing to the tag.
  clear: () => void;
  setText: (text: string) => void;
  // Everything shown again (leaving the board).
  reset: () => void;
};

export const useFilterStore = create<FilterState>()(set => ({
  tag: undefined,
  text: "",
  show: tag => {
    set({ tag });
  },
  clear: () => {
    set({ tag: undefined });
  },
  setText: text => {
    set({ text });
  },
  reset: () => {
    set({ tag: undefined, text: "" });
  },
}));
