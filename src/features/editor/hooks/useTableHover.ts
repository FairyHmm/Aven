import { type PointerEvent, type RefObject, useState } from "react";

import { type Hover, hoverOf } from "../components/table/geometry";

// Which edge of the table the pointer is near, for the grips and the add
// strips. `frozen` (a drag, an open menu) keeps it from changing.
export function useTableHover(
  root: RefObject<HTMLElement | null>,
  frozen: boolean,
) {
  const [hover, setHover] = useState<Hover>();
  return {
    hover,
    onMove: (event: PointerEvent) => {
      if (!frozen && root.current) {
        setHover(hoverOf(root.current, { x: event.clientX, y: event.clientY }));
      }
    },
    onLeave: () => {
      if (!frozen) {
        setHover(undefined);
      }
    },
  };
}
