import { useRef, type CSSProperties, type ReactNode } from "react";

import { useFlip } from "../hooks/useFlip";
import { useSortableItem } from "../hooks/useSortableItem";
import type { Axis } from "../lib/dnd/data";
import { gapBefore } from "../lib/dnd/reorder";
import { useDragStore } from "../stores/dragStore";

type Props = {
  kind: string;
  id: string;
  listId: string;
  axis: Axis;
  // Position in the list and the list's length: needed to open the gap.
  index: number;
  count: number;
  handle?: string;
  disabled?: boolean;
  className?: string;
  // Entrance animation options (see useFlip).
  delay?: number;
  enterOnLoad?: boolean;
  children: ReactNode;
};

// Wrapper that makes anything a draggable, reorderable, gliding list item.
// It owns the margins that open the gap while something is dragged over, so
// the content inside keeps its own styles and transitions untouched.
export function SortableItem({
  kind,
  id,
  listId,
  axis,
  index,
  count,
  handle,
  disabled,
  className,
  delay,
  enterOnLoad,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { phase, collapse } = useSortableItem(ref, {
    kind,
    id,
    listId,
    axis,
    index,
    handle,
    disabled,
  });
  useFlip(ref, `${kind}:${id}`, { delay, enterOnLoad });

  // Room opened before this item (the drop lands above/left of it) or after
  // it (the drop lands at the end of the list). The item being dragged never
  // makes room for itself; it collapses instead, with the same animated
  // margin, so the room it gives back and the room opened for the drop trade
  // off smoothly.
  const lifted = phase !== "idle";
  const gap = useDragStore(state => {
    if (lifted || state.kind !== kind || state.listId !== listId) {
      return 0;
    }
    const { before, after } = gapBefore(state, index, count);
    return (before ? state.size : 0) + (after ? -state.size : 0);
  });
  const trailing = gap < 0;
  const size = Math.abs(gap);
  const start = axis === "vertical" ? "marginTop" : "marginLeft";
  const end = axis === "vertical" ? "marginBottom" : "marginRight";
  const limit = axis === "vertical" ? "maxHeight" : "maxWidth";
  const style: CSSProperties = {
    [start]: trailing ? 0 : size,
    [end]: trailing ? size : 0,
  };
  if (collapse !== undefined) {
    // Folding away: the box shrinks to nothing (so it adds no scrollable
    // overflow) and takes back the list's gap.
    style[limit] = collapse.shrunk ? 0 : collapse.size;
    style[end] = collapse.shrunk ? -collapse.gap : 0;
    style.overflow = "hidden";
  }

  return (
    <div
      ref={ref}
      className={className}
      data-sortable-item={kind}
      data-flip={`${kind}:${id}`}
      data-dragging={lifted ? phase : undefined}
      style={style}
    >
      {children}
    </div>
  );
}
