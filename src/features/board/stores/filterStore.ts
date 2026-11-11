import { create } from "zustand";

// The tag the board is narrowed to (clicking a tag), with everything beneath
// it. Cards can't be dragged while it is on: the drop position would be
// counted in a column that hides some of its cards.
type FilterState = {
  tag: string | undefined;
  show: (tag: string) => void;
  clear: () => void;
};

export const useFilterStore = create<FilterState>()(set => ({
  tag: undefined,
  show: tag => {
    set({ tag });
  },
  clear: () => {
    set({ tag: undefined });
  },
}));
