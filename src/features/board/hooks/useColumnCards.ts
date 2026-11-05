import { useMemo } from "react";

import { cardsOf } from "../lib/mutations";
import { useBoardStore } from "../stores/boardStore";

// A column's cards, in order.
export function useColumnCards(columnId: string) {
  const cards = useBoardStore(state => state.cards);
  return useMemo(() => cardsOf({ cards }, columnId), [cards, columnId]);
}
