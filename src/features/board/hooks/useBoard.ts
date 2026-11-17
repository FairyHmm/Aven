import { useEffect, useMemo } from "react";

import { STORAGE_MODE } from "../../../shared/lib/storageMode";
import { useSpace } from "../../space/hooks/useSpaces";
import { sortedColumns } from "../lib/mutations";
import { useBoardStore } from "../stores/boardStore";
import { useEditorStore } from "../stores/editorStore";
import { useFieldStore } from "../stores/fieldStore";
import { useFilterStore } from "../stores/filterStore";
import { useTagStore } from "../stores/tagStore";

// Loads the board for the route and returns what the surface itself shows:
// the columns in order, a card count and the load/save status.
export function useBoard(spaceId: string, boardId: string) {
  const { space } = useSpace(spaceId);
  const tagColors = space?.tagColors;
  const fieldConfig = space?.fieldConfig;

  useEffect(() => {
    if (STORAGE_MODE === "firebase" && space !== undefined) {
      useTagStore.getState().hydrate(spaceId, tagColors);
      useFieldStore.getState().hydrate(spaceId, fieldConfig);
    }
  }, [spaceId, space, tagColors, fieldConfig]);

  useEffect(() => {
    useTagStore.getState().load(spaceId);
    useFieldStore.getState().load(spaceId);
    useBoardStore.getState().actions.load({ spaceId, boardId });
    return () => {
      useBoardStore.getState().actions.unload();
      useEditorStore.getState().close();
      useFilterStore.getState().clear();
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
