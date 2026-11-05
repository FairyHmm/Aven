import { useEffect, useMemo } from "react";

import { sortedColumns } from "../lib/mutations";
import { useBoardStore } from "../stores/boardStore";
import { useEditorStore } from "../stores/editorStore";

// Loads the board for the route and returns what the surface itself shows:
// the columns in order, a card count and the load/save status. Anything
// deeper (a column's cards, the actions, the open editor) is read where it is
// used, through the other hooks here, instead of being passed down.
export function useBoard(spaceId: string, boardId: string) {
  useEffect(() => {
    void useBoardStore.getState().actions.load({ spaceId, boardId });
    return () => {
      useEditorStore.getState().close();
    };
  }, [spaceId, boardId]);

  const columns = useBoardStore(state => state.columns);
  const cardCount = useBoardStore(state => state.cards.length);
  const status = useBoardStore(state => state.status);
  const pending = useBoardStore(state => state.pending);
  const error = useBoardStore(state => state.error);

  const sorted = useMemo(() => sortedColumns({ columns }), [columns]);

  return { columns: sorted, cardCount, status, saving: pending > 0, error };
}
