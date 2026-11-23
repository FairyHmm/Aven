import { create } from "zustand";

// Whether the archive column is showing at the end of the board.
type ArchiveViewState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useArchiveViewStore = create<ArchiveViewState>()(set => ({
  open: false,
  setOpen: open => {
    set({ open });
  },
}));
