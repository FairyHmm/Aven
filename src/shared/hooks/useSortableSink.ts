import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState, type RefObject } from "react";

import { listData, readItem, type ItemData } from "../lib/dnd/data";
import { useDragStore } from "../stores/dragStore";

type Options = {
  kind: string;
  listId: string;
  // Which items it takes (default: all of the kind). Keep it a stable
  // function.
  accepts?: (item: ItemData) => boolean;
};

// Makes an element (a button) take items of `kind` dropped on it, as if it
// were a list that has no room to show them: the drop reports `listId` with
// index 0, and the dragged picture is drawn into the element (see settle.ts)
// unless the item shows up somewhere else the moment it is dropped.
export function useSortableSink(
  ref: RefObject<HTMLElement | null>,
  { kind, listId, accepts }: Options,
) {
  const [over, setOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (element === null) {
      return undefined;
    }
    const aim = () => {
      useDragStore.getState().aimAtSink(kind, listId, element);
    };
    return dropTargetForElements({
      element,
      canDrop: ({ source }) => {
        const item = readItem(source.data);
        return item?.kind === kind && (accepts?.(item) ?? true);
      },
      getData: () => listData(kind, listId),
      onDragEnter: () => {
        setOver(true);
        aim();
      },
      onDrag: aim,
      onDragLeave: () => {
        setOver(false);
        useDragStore.getState().clearFrom(kind, listId);
      },
      onDrop: () => {
        setOver(false);
      },
    });
  }, [ref, kind, listId, accepts]);

  return { over };
}
