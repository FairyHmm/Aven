import { GripHorizontal, GripVertical } from "lucide-react";
import type { PointerEvent } from "react";

import type { Axis, Hover, Line } from "./geometry";

import classes from "./editor.module.css";

const GRIP = 22; // the long side of a grip

type Props = {
  hover: Hover | undefined;
  line: Line | undefined;
  onPress: (
    axis: Axis,
    index: number,
    event: PointerEvent<HTMLButtonElement>,
  ) => void;
};

// The grip of the row or column the pointer is by the edge of: it floats just
// off the table's edge. Drag it to move the row or column, click it for its
// menu. While one is dragged, the line shows where it would land.
export function TableGrips({ hover, line, onPress }: Props) {
  const column = hover?.axis === "column";
  return (
    <>
      {hover !== undefined && (
        <button
          type="button"
          className={`${classes.grip} ${column ? classes.gripColumn : classes.gripRow}`}
          style={
            column
              ? { left: hover.at - GRIP / 2 }
              : { top: hover.at - GRIP / 2 }
          }
          title={`Drag to move the ${hover.axis}, click for more`}
          aria-label={`${column ? "Column" : "Row"} ${hover.index + 1}`}
          onPointerDown={event => {
            onPress(hover.axis, hover.index, event);
          }}
        >
          {column ? <GripHorizontal size={8} /> : <GripVertical size={8} />}
        </button>
      )}
      {line !== undefined && (
        <div
          className={`${classes.line} ${
            line.axis === "column" ? classes.lineColumn : classes.lineRow
          }`}
          style={
            line.axis === "column"
              ? { left: line.x - 1, top: line.y, height: line.length }
              : { left: line.x, top: line.y - 1, width: line.length }
          }
        />
      )}
    </>
  );
}
