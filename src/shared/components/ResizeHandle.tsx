import { useResizeHandle } from "../hooks/useResizeHandle";

import classes from "./resizeHandle.module.css";

type Props = {
  axis: "x" | "y";
  label: string;
  // The size shown right now (for assistive technology).
  value: number;
  min: number;
  max: number;
  step?: number;
  size: () => number;
  onResize: (size: number) => void;
  onCommit: (size: number) => void;
  onReset: () => void;
};

// An edge that is dragged (or arrowed) to resize what it belongs to: `x` is a
// vertical bar on a right edge, `y` a horizontal one on a bottom edge. It
// shows only while the pointer is near it or while it has focus.
export function ResizeHandle({
  axis,
  label,
  value,
  min,
  max,
  step = 16,
  size,
  onResize,
  onCommit,
  onReset,
}: Props) {
  const { dragging, handlers } = useResizeHandle({
    axis,
    size,
    min,
    max,
    step,
    onResize,
    onCommit,
    onReset,
  });
  return (
    <div
      className={classes.handle}
      data-axis={axis}
      data-dragging={dragging ? "" : undefined}
      role="separator"
      aria-orientation={axis === "x" ? "vertical" : "horizontal"}
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      {...handlers}
    >
      <span className={classes.grip} aria-hidden="true" />
    </div>
  );
}
