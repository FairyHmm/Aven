import { create } from "zustand";

// Whether the shortcuts cheat sheet is open (`?` opens it).
type HelpState = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
};

export const useHelpStore = create<HelpState>()(set => ({
  opened: false,
  setOpened: opened => {
    set({ opened });
  },
}));
