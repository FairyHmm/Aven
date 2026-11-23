import { useEffect, useMemo } from "react";

import { STORAGE_MODE } from "../../../shared/lib/storageMode";
import { preloadCodeEditor } from "../../editor/components/CodeEditorLazy";
import { useCanEditSpace, useSpace } from "../../space/hooks/useSpaces";
import { sortedColumns } from "../lib/mutations";
import { useArchiveViewStore } from "../stores/archiveViewStore";
import { useBoardStore } from "../stores/boardStore";
import { useEditorStore } from "../stores/editorStore";
import { useFieldStore } from "../stores/fieldStore";
import { useFilterStore } from "../stores/filterStore";
import { useTagStore } from "../stores/tagStore";

// Loads the board for the route and returns what the surface itself shows:
// the columns in order, a card count and the load/save status.
export function useBoard(spaceId: string, boardId: string) {
  const { space } = useSpace(spaceId);
  const canEdit = useCanEditSpace(spaceId);
  const tagColors = space?.tagColors;
  const fieldConfig = space?.fieldConfig;

  useEffect(() => {
    if (STORAGE_MODE === "firebase" && space !== undefined) {
      useTagStore.getState().hydrate(spaceId, tagColors);
      useFieldStore.getState().hydrate(spaceId, fieldConfig);
    }
  }, [spaceId, space, tagColors, fieldConfig]);

  // Declared before the load effect so the board knows who is looking before
  // it opens (an empty board is only seeded for someone who may write it).
  useEffect(() => {
    useBoardStore.getState().actions.setCanEdit(canEdit);
  }, [canEdit]);

  useEffect(() => {
    useTagStore.getState().load(spaceId);
    useFieldStore.getState().load(spaceId);
    useBoardStore.getState().actions.load({ spaceId, boardId });
    return () => {
      useBoardStore.getState().actions.unload();
      useEditorStore.getState().close();
      useFilterStore.getState().reset();
      useArchiveViewStore.getState().setOpen(false);
    };
  }, [spaceId, boardId]);

  const columns = useBoardStore(state => state.columns);
  // Archived cards are set aside, not on the board.
  const cardCount = useBoardStore(
    state => state.cards.filter(card => card.archivedAt === undefined).length,
  );
  const status = useBoardStore(state => state.status);
  const pending = useBoardStore(state => state.pending);
  const error = useBoardStore(state => state.error);

  // Someone who can edit will want the editor: fetch it as soon as the board
  // has shown, so nothing else waits on it and it is there for the first edit.
  useEffect(() => {
    if (canEdit && status === "ready") {
      void preloadCodeEditor();
    }
  }, [canEdit, status]);

  const sorted = useMemo(() => sortedColumns({ columns }), [columns]);

  return { columns: sorted, cardCount, status, saving: pending > 0, error };
}
