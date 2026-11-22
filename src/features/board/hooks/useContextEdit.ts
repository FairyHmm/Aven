import type { MouseEvent } from "react";

import { useCanEdit } from "./useCanEdit";
import { useEditCard } from "./useCardEditor";

// A right-click on a card tile, or a long press on a phone (which sends the
// same event), opens the quick edit. A link keeps its own menu, and someone
// who can't edit the board keeps the browser's.
export function useContextEdit(id: string) {
  const canEdit = useCanEdit();
  const edit = useEditCard();
  return (event: MouseEvent<HTMLElement>) => {
    const onLink =
      event.target instanceof Element && event.target.closest("a") !== null;
    if (canEdit && !onLink) {
      event.preventDefault();
      edit(id);
    }
  };
}
