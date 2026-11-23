import { useMemo } from "react";

import { shownCards } from "../lib/shown";
import { useBoardStore } from "../stores/boardStore";
import { useFilterStore } from "../stores/filterStore";

// A column's cards, in order; only those that fit what the board is narrowed
// to (a label, some text), if it is.
export function useColumnCards(columnId: string) {
  const cards = useBoardStore(state => state.cards);
  const tag = useFilterStore(state => state.tag);
  const text = useFilterStore(state => state.text);
  return useMemo(
    () => shownCards({ cards }, columnId, { tag, text }),
    [cards, columnId, tag, text],
  );
}
