import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useRef,
} from "react";

import { pressControl } from "../lib/dnd/press";

// Handlers for a small button inside a draggable item (a tag chip on a card).
// A click is not reliably delivered there, and a shaky press would start a
// card drag, so the button acts on release and registers the press with the
// drag layer (see lib/dnd/press.ts). Enter/Space still go through `click`.
// Nothing reaches the card around it.
export function usePressable(run: () => void) {
  const pressed = useRef(false);
  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0) {
        return;
      }
      pressed.current = true;
      pressControl(event, run);
    },
    onPointerLeave: () => {
      pressed.current = false;
    },
    onPointerUp: () => {
      if (pressed.current) {
        pressed.current = false;
        run();
      }
    },
    onClick: (event: MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      if (event.detail === 0) {
        run();
      }
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      event.stopPropagation();
    },
  };
}
