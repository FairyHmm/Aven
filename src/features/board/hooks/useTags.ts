import { useMemo } from "react";

import type { LabelColor } from "../lib/labels/labelColors";
import { knownTags } from "../lib/labels/tags";
import { tagsOf } from "../lib/props/defaults";
import { useBoardStore } from "../stores/boardStore";
import { useFilterStore } from "../stores/filterStore";
import { useTagStore } from "../stores/tagStore";
import { useBoardActions } from "./useBoardActions";

export function useTagColors() {
  return useTagStore(state => state.colors);
}

export function useSetTagColor() {
  return useTagStore(state => state.setColor);
}

// Every tag in use on the board or given a colour in the space; `extra` are
// ones not saved yet (picked in an editor that is still open).
export function useKnownTags(extra: string[]) {
  const cards = useBoardStore(state => state.cards);
  const colors = useTagColors();
  return useMemo(
    () =>
      knownTags(
        cards.map(card => tagsOf(card.props)),
        colors,
        extra,
      ),
    [cards, colors, extra],
  );
}

// Change a label: its name (the cards that carry it follow, on this board)
// and its colour.
export function useRelabel() {
  const { renameTag } = useBoardActions();
  const relabel = useTagStore(state => state.relabel);
  return (from: string, to: string, color: LabelColor) => {
    renameTag(from, to);
    relabel(from, to, color);
  };
}

// The tag the board is narrowed to, and how to change that.
export function useTagFilter() {
  const tag = useFilterStore(state => state.tag);
  const show = useFilterStore(state => state.show);
  const clear = useFilterStore(state => state.clear);
  return { tag, show, clear };
}
