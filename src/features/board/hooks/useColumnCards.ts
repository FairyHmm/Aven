import { useMemo } from "react";

import { underTag } from "../lib/labels/tags";
import { cardsOf } from "../lib/mutations";
import { tagsOf } from "../lib/props/defaults";
import { useBoardStore } from "../stores/boardStore";
import { useFilterStore } from "../stores/filterStore";

// A column's cards, in order; only those under the tag the board is narrowed
// to, if it is.
export function useColumnCards(columnId: string) {
  const cards = useBoardStore(state => state.cards);
  const filter = useFilterStore(state => state.tag);
  return useMemo(() => {
    const all = cardsOf({ cards }, columnId);
    return filter === undefined
      ? all
      : all.filter(card => underTag(tagsOf(card.props), filter));
  }, [cards, columnId, filter]);
}
