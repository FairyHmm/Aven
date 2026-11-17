import { create } from "zustand";

import { STORAGE_MODE } from "../../../shared/lib/storageMode";
import { spaceStorage } from "../../space/stores/storage";
import type { LabelColor } from "../lib/labels/labelColors";
import { parseColors, type TagColors } from "../lib/labels/tags";

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
  hydrate: (spaceId: string, raw: unknown) => void;
  setColor: (tag: string, color: LabelColor) => void;
  relabel: (from: string, to: string, color: LabelColor) => void;
};

export const useTagStore = create<TagState>()((set, get) => {
  const save = (colors: TagColors) => {
    set({ colors });
    const { spaceId } = get();
    if (spaceId === undefined) return;
    if (STORAGE_MODE === "firebase") {
      void spaceStorage.saveSettings(spaceId, { tagColors: colors });
      return;
    }
    try {
      localStorage.setItem(keyOf(spaceId), JSON.stringify(colors));
    } catch {
      // Not saved; the colour still shows until the page is reloaded.
    }
  };
  return {
    spaceId: undefined,
    colors: {},
    load: spaceId => {
      if (get().spaceId !== spaceId) {
        set({
          spaceId,
          colors: STORAGE_MODE === "firebase" ? {} : read(spaceId),
        });
      }
    },
    hydrate: (spaceId, raw) => {
      set({ spaceId, colors: parseColors(raw ?? {}) });
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
