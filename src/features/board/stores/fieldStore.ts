import { create } from "zustand";

import { STORAGE_MODE } from "../../../shared/lib/storageMode";
import { spaceStorage } from "../../space/stores/storage";
import { type LabelColor } from "../lib/labels/labelColors";
import { keyOf, parseSaved, read, type Saved } from "./fieldStorage";

// Dropdown lists, and which field uses which, are a space-level setting
// shared by every board in the space, like label colours (see tagStore.ts): a
// field's name is what ties its cards to a list.

type FieldState = Saved & {
  spaceId: string | undefined;
  load: (spaceId: string) => void;
  hydrate: (spaceId: string, raw: unknown) => void;
  // A list with these options; one that exists is left as it is.
  createList: (name: string, options?: string[]) => void;
  // `field` becomes a dropdown on `list`, or a plain field again.
  link: (field: string, list: string) => void;
  unlink: (field: string) => void;
  addOption: (list: string, option: string, color?: LabelColor) => void;
  // The option under a new name and colour (a rename keeps its place).
  renameOption: (
    list: string,
    from: string,
    to: string,
    color: LabelColor,
  ) => void;
  removeOption: (list: string, option: string) => void;
  // The option to this place in the list (0 is the first).
  moveOption: (list: string, option: string, to: number) => void;
  // The link follows a field to its new name.
  renameField: (from: string, to: string) => void;
};

export const useFieldStore = create<FieldState>()((set, get) => {
  const save = (next: Partial<Saved>) => {
    set(next);
    const { spaceId, lists, links, colors } = get();
    if (spaceId === undefined) return;
    if (STORAGE_MODE === "firebase") {
      void spaceStorage.saveSettings(spaceId, {
        fieldConfig: { lists, links, colors },
      });
      return;
    }
    try {
      localStorage.setItem(
        keyOf(spaceId),
        JSON.stringify({ lists, links, colors }),
      );
    } catch {
      // Not saved; they still show until the page is reloaded.
    }
  };
  const options = (list: string) => get().lists[list] ?? [];
  return {
    spaceId: undefined,
    lists: {},
    links: {},
    colors: {},
    load: spaceId => {
      if (get().spaceId !== spaceId) {
        set({
          spaceId,
          ...(STORAGE_MODE === "firebase"
            ? parseSaved(undefined)
            : read(spaceId)),
        });
      }
    },
    hydrate: (spaceId, raw) => {
      set({ spaceId, ...parseSaved(raw) });
    },
    createList: (name, initial = []) => {
      if (!(name in get().lists)) {
        save({ lists: { ...get().lists, [name]: [...new Set(initial)] } });
      }
    },
    link: (field, list) => {
      save({ links: { ...get().links, [field]: list } });
    },
    unlink: field => {
      save({
        links: Object.fromEntries(
          Object.entries(get().links).filter(([key]) => key !== field),
        ),
      });
    },
    addOption: (list, option, color) => {
      const { lists, colors } = get();
      save({
        lists: options(list).includes(option)
          ? lists
          : { ...lists, [list]: [...options(list), option] },
        colors:
          color === undefined
            ? colors
            : { ...colors, [list]: { ...colors[list], [option]: color } },
      });
    },
    renameOption: (list, from, to, color) => {
      const renamed = options(list).map(option =>
        option === from ? to : option,
      );
      const { [from]: _, ...rest } = get().colors[list] ?? {};
      save({
        lists: { ...get().lists, [list]: [...new Set(renamed)] },
        colors: { ...get().colors, [list]: { ...rest, [to]: color } },
      });
    },
    removeOption: (list, option) => {
      const { [option]: _, ...rest } = get().colors[list] ?? {};
      save({
        lists: {
          ...get().lists,
          [list]: options(list).filter(item => item !== option),
        },
        colors: { ...get().colors, [list]: rest },
      });
    },
    moveOption: (list, option, to) => {
      const rest = options(list).filter(item => item !== option);
      if (rest.length === options(list).length) {
        return;
      }
      rest.splice(to, 0, option);
      save({ lists: { ...get().lists, [list]: rest } });
    },
    renameField: (from, to) => {
      const list = get().links[from];
      if (list !== undefined) {
        save({
          links: Object.fromEntries(
            Object.entries(get().links).map(([key, value]) => [
              key === from ? to : key,
              value,
            ]),
          ),
        });
      }
    },
  };
});
