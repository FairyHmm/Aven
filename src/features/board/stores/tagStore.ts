import { create } from "zustand";

import type { LabelColor } from "../lib/labels/labelColors";
import { parseColors, type TagColors } from "../lib/labels/tags";

// Label colours are a space-level setting, shared by every board in the
// space. Spaces are still fixtures, so they are kept in localStorage per
// space; they move next to the space document when Firestore lands.
const keyOf = (spaceId: string) => `aven:v1:space:${spaceId}:tag-colors`;

function read(spaceId: string): TagColors {
  try {
    const raw = localStorage.getItem(keyOf(spaceId));
    return parseColors(raw === null ? {} : JSON.parse(raw));
  } catch {
    return {};
  }
}

type TagState = {
  spaceId: string | undefined;
  colors: TagColors;
  load: (spaceId: string) => void;
  setColor: (tag: string, color: LabelColor) => void;
  // `from` (and what is beneath it) becomes `to`, which gets `color`.
  relabel: (from: string, to: string, color: LabelColor) => void;
};

export const useTagStore = create<TagState>()((set, get) => {
  const save = (colors: TagColors) => {
    set({ colors });
    const { spaceId } = get();
    if (spaceId !== undefined) {
      try {
        localStorage.setItem(keyOf(spaceId), JSON.stringify(colors));
      } catch {
        // Not saved; the colour still shows until the page is reloaded.
      }
    }
  };
  return {
    spaceId: undefined,
    colors: {},
    load: spaceId => {
      if (get().spaceId !== spaceId) {
        set({ spaceId, colors: read(spaceId) });
      }
    },
    setColor: (tag, color) => {
      save({ ...get().colors, [tag]: color });
    },
    relabel: (from, to, color) => {
      const moved: TagColors = {};
      for (const [tag, own] of Object.entries(get().colors)) {
        if (tag === from) {
          continue;
        }
        moved[
          tag.startsWith(`${from}/`) ? `${to}${tag.slice(from.length)}` : tag
        ] = own;
      }
      save({ ...moved, [to]: color });
    },
  };
});
