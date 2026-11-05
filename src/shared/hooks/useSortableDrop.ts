import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef } from "react";

import { readItem, type SortableMove } from "../lib/dnd/data";
import { useDragStore } from "../stores/dragStore";

// Listens for drops of items of `kind` and reports where they landed. One per
// kind per screen. The position is the drag store's preview, so the result is
// exactly what the "make room" gap showed; a drop outside any list reports
// nothing and the dragged clone glides back.
export function useSortableDrop(
  kind: string,
  onMove: (move: SortableMove) => void,
) {
  const latest = useRef(onMove);
  latest.current = onMove;

  useEffect(
    () =>
      monitorForElements({
        canMonitor: ({ source }) => readItem(source.data)?.kind === kind,
        onDrop: ({ source }) => {
          const item = readItem(source.data);
          const target = useDragStore.getState();
          if (
            item !== undefined &&
            target.kind === kind &&
            target.listId !== undefined
          ) {
            latest.current({
              kind,
              id: item.id,
              fromListId: item.listId,
              toListId: target.listId,
              index: target.index,
            });
          }
          target.end();
        },
      }),
    [kind],
  );
}
