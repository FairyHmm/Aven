import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

type Options = {
  axis: "x" | "y";
  // The size when a drag or key press starts.
  size: () => number;
  min: number;
  max: number;
  // Arrow keys move by this much (Shift takes four).
  step: number;
  // Every move of a drag, before it is committed.
  onResize: (size: number) => void;
  // The drag ended, or a key was pressed.
  onCommit: (size: number) => void;
  // Double click, Enter and Home.
  onReset: () => void;
};

type Drag = { origin: number; start: number; size: number };

// Pointer and keyboard behaviour of a resize handle. Pressing it must not
// start the native drag of the draggable item it sits in, and neither the
// click nor the key presses may reach that item (a tile opens on both).
export function useResizeHandle(options: Options) {
  const drag = useRef<Drag | undefined>(undefined);
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });
  const [dragging, setDragging] = useState(false);

  const clamp = (size: number) =>
    Math.min(latest.current.max, Math.max(latest.current.min, size));
  const coordinate = (event: PointerEvent) =>
    latest.current.axis === "x" ? event.clientX : event.clientY;

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const start = latest.current.size();
    drag.current = { origin: coordinate(event), start, size: start };
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (current === undefined) {
      return;
    }
    current.size = clamp(current.start + coordinate(event) - current.origin);
    latest.current.onResize(current.size);
  };

  const finish = (event: PointerEvent<HTMLElement>, commit: boolean) => {
    const current = drag.current;
    drag.current = undefined;
    setDragging(false);
    if (current === undefined) {
      return;
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (commit && current.size !== current.start) {
      latest.current.onCommit(current.size);
    } else {
      // Nothing changed (or Esc-like cancel): show the stored size again.
      latest.current.onResize(current.start);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const { axis, step } = latest.current;
    const more = axis === "x" ? "ArrowRight" : "ArrowDown";
    const less = axis === "x" ? "ArrowLeft" : "ArrowUp";
    event.stopPropagation();
    if (event.key === "Enter" || event.key === "Home") {
      event.preventDefault();
      latest.current.onReset();
      return;
    }
    if (event.key !== more && event.key !== less) {
      return;
    }
    event.preventDefault();
    const amount = event.shiftKey ? step * 4 : step;
    const size = clamp(
      latest.current.size() + (event.key === more ? amount : -amount),
    );
    latest.current.onResize(size);
    latest.current.onCommit(size);
  };

  return {
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: PointerEvent<HTMLElement>) => {
        finish(event, true);
      },
      onPointerCancel: (event: PointerEvent<HTMLElement>) => {
        finish(event, false);
      },
      // A native drag of the item around must never start from here.
      onMouseDown: (event: { preventDefault: () => void }) => {
        event.preventDefault();
      },
      onClick: (event: { stopPropagation: () => void }) => {
        event.stopPropagation();
      },
      onDoubleClick: () => {
        latest.current.onReset();
      },
      onKeyDown,
    },
  };
}
