import { type PointerEvent as ReactPointerEvent, useState } from "react";

import {
  createDragLayer,
  type DragLayer,
} from "../../../shared/lib/dnd/dragLayer";
import { releaseHeld } from "../../../shared/lib/dnd/flip";
import {
  type Axis,
  type Line,
  lineAt,
  boxOf,
  targetIndex,
} from "../components/table/geometry";
import { ghostOf } from "../components/table/ghost";
import { landing } from "../lib/table/model";

export type Drag = { axis: Axis; from: number; line: Line | undefined };

// What a cell shows while its row or column is dragged (`lift`) or picked with
// its grip for the menu (`pick`).
export function markOf(
  drag: Drag | undefined,
  picked: { axis: Axis; index: number } | undefined,
  row: number,
  column: number,
): "lift" | "pick" | undefined {
  const moving =
    drag === undefined ? picked : { axis: drag.axis, index: drag.from };
  if (
    moving === undefined ||
    (moving.axis === "row" ? row : column) !== moving.index
  ) {
    return undefined;
  }
  return drag === undefined ? "pick" : "lift";
}

type Options = {
  root: { current: HTMLElement | null };
  // A row or column was dropped somewhere else: put it before `to`.
  onMove: (axis: Axis, from: number, to: number) => void;
  // The grip was pressed and released without dragging.
  onPick: (axis: Axis, index: number) => void;
};

const LIFT = 5; // px of travel before a press becomes a drag

// Dragging a row or column by its grip. The floating picture is the shared
// drag layer's (it chases the pointer and tilts), but a table cannot open a
// gap the way a list does, so the drop is previewed with a line instead.
export function useTableDrag({ root, onMove, onPick }: Options) {
  const [drag, setDrag] = useState<Drag>();

  const press = (
    axis: Axis,
    index: number,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    const found = root.current;
    if (found === null || event.button !== 0) {
      return;
    }
    // The nested functions below don't keep the narrowing.
    const table: HTMLElement = found;
    event.preventDefault();
    const start = { x: event.clientX, y: event.clientY };
    const key = `table:${axis}:${index}`;
    let layer: DragLayer | undefined;
    let to = index;

    const finish = (apply: boolean) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("keydown", keys, true);
      setDrag(undefined);
      const lifted = layer;
      if (lifted === undefined) {
        if (apply) {
          onPick(axis, index);
        }
        return;
      }
      lifted.freeze();
      const end = apply ? landing(index, to) : index;
      if (end !== index) {
        onMove(axis, index, to);
      }
      // Once the table has been drawn again, fly to where the row landed.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const done = () => {
            lifted.remove();
            releaseHeld(key);
          };
          const rect = boxOf(table, axis, end);
          if (rect === undefined) {
            done();
          } else {
            lifted.glideBack(rect, done);
          }
        });
      });
    };

    function move(next: PointerEvent) {
      if (layer === undefined) {
        if (Math.hypot(next.clientX - start.x, next.clientY - start.y) < LIFT) {
          return;
        }
        const ghost = ghostOf(table, axis, index);
        layer = ghost && createDragLayer(ghost, key, start);
        ghost?.remove();
        if (layer === undefined) {
          return;
        }
      }
      layer.move(next.clientX, next.clientY);
      to = targetIndex(table, axis, { x: next.clientX, y: next.clientY });
      setDrag({ axis, from: index, line: lineAt(table, axis, to) });
    }
    function up() {
      finish(true);
    }
    function keys(next: KeyboardEvent) {
      if (next.key === "Escape" && layer !== undefined) {
        next.stopPropagation();
        finish(false);
      }
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    // In the capture phase: Escape cancels the drag, not the card around it.
    window.addEventListener("keydown", keys, true);
  };

  return { drag, press };
}
