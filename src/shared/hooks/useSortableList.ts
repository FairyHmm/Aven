import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState, type RefObject } from "react";

import { listData, liftedSize, readItem, type Axis } from "../lib/dnd/data";
import { dropIndex } from "../lib/dnd/reorder";
import { useDragStore } from "../stores/dragStore";

type Options = {
  kind: string;
  listId: string;
  axis: Axis;
  // Space between items, added to the room opened for the dragged one.
  gap: number;
  count: number;
};

const toNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

// Makes an element a drop target for items of `kind`. The drop position comes
// from the pointer against the items' midpoints, discounting the room already
// opened for the preview so the gap doesn't chase the pointer.
export function useSortableList(
  ref: RefObject<HTMLElement | null>,
  { kind, listId, axis, gap, count }: Options,
) {
  const [over, setOver] = useState(false);
  // A list with nothing visible has no item to push, so it is told how much
  // room to open. Its only item may be the one being dragged out of it.
  const emptySize = useDragStore(state => {
    if (state.kind !== kind || state.listId !== listId) {
      return 0;
    }
    const visible = count - (state.from === -1 ? 0 : 1);
    return visible === 0 ? state.size : 0;
  });

  useEffect(() => {
    const element = ref.current;
    if (element === null) {
      return undefined;
    }
    const vertical = axis === "vertical";
    return dropTargetForElements({
      element,
      canDrop: ({ source }) => readItem(source.data)?.kind === kind,
      getData: () => listData(kind, listId),
      onDragEnter: () => {
        setOver(true);
      },
      onDrag: ({ location, source }) => {
        const { clientX, clientY } = location.current.input;
        const pointer = vertical ? clientY : clientX;
        const lifted = liftedSize.get(source.element);
        const fallback = lifted ?? source.element.getBoundingClientRect();
        const size = (vertical ? fallback.height : fallback.width) + gap;
        let pushed = 0; // room already opened before the item being measured
        const items = [
          ...element.querySelectorAll<HTMLElement>(
            `[data-sortable-item="${kind}"]`,
          ),
        ];
        // `from` is the dragged item's position in this list (-1: it comes
        // from another). It collapses to nothing, so it is not measured, and
        // whatever it has not collapsed yet counts as room already opened.
        const from = items.indexOf(source.element);
        const slots: { mid: number }[] = [];
        for (const item of items) {
          const style = getComputedStyle(item);
          const head = toNumber(vertical ? style.marginTop : style.marginLeft);
          const tail = toNumber(
            vertical ? style.marginBottom : style.marginRight,
          );
          if (item === source.element) {
            // What it has not folded away yet (its size plus margins, and the
            // gap before it) still pushes the items after it.
            const own = item.getBoundingClientRect();
            pushed += (vertical ? own.height : own.width) + head + tail + gap;
            continue;
          }
          pushed += head;
          const box = item.getBoundingClientRect();
          slots.push({
            mid: vertical
              ? box.top - pushed + box.height / 2
              : box.left - pushed + box.width / 2,
          });
          pushed += tail;
        }
        // Position among the visible items, turned into an index in the full
        // list (which counts the dragged item) for the drop.
        const slot = dropIndex(pointer, slots);
        const index = from !== -1 && slot >= from ? slot + 1 : slot;
        useDragStore.getState().setTarget(kind, listId, index, size, from);
      },
      onDragLeave: () => {
        setOver(false);
        useDragStore.getState().clearFrom(kind, listId);
      },
      onDrop: () => {
        setOver(false);
      },
    });
  }, [ref, kind, listId, axis, gap]);

  return { over, emptySize };
}
