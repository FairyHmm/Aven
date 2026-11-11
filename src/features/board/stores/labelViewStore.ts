import { create } from "zustand";

// Whether card labels show their text or just colour strips.
// Toggled globally and persisted per browser.
const KEY = "aven:v1:labels-expanded";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

type LabelView = { expanded: boolean; toggle: () => void };

export const useLabelView = create<LabelView>()((set, get) => ({
  expanded: read(),
  toggle: () => {
    const expanded = !get().expanded;
    set({ expanded });
    try {
      localStorage.setItem(KEY, expanded ? "1" : "0");
    } catch {
      // Only for this session.
    }
  },
}));
