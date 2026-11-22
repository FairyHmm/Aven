import { create } from "zustand";

// Whether the boards drawer is open. On a narrow screen the list of boards
// doesn't sit beside the board but opens from a button in the header, which
// is outside the space layout, so the two share this.
type BoardsDrawer = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
};

export const useBoardsDrawer = create<BoardsDrawer>(set => ({
  opened: false,
  setOpened: opened => {
    set({ opened });
  },
}));

// The width below which the boards list becomes a drawer (Mantine's `sm`).
export const NARROW = "(max-width: 48em)";
