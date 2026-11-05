import { useLayoutEffect, useRef, type RefObject } from "react";

import {
  EASE,
  isSettling,
  prefersReducedMotion,
  takeFrom,
} from "../lib/dnd/flip";

type Options = {
  // Stagger for the entrance when the whole board has just loaded.
  delay?: number | undefined;
  // Animate the entrance on board load too (columns do; cards don't, they
  // ride in with their column).
  enterOnLoad?: boolean | undefined;
};

// Glide to a new position after a mutation (FLIP) and fade/rise in when the
// element first appears. A dropped item is not animated here: its drag clone
// flies to it and levels out in the unclipped layer above the board, and the
// item shows once the clone has landed (see settle in useSortableItem.ts).
export function useFlip(
  ref: RefObject<HTMLElement | null>,
  key: string,
  { delay = 0, enterOnLoad = false }: Options = {},
) {
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const element = ref.current;
    const first = !mounted.current;
    mounted.current = true;
    if (element === null || prefersReducedMotion()) {
      return;
    }

    const from = takeFrom(key);
    if (from !== undefined) {
      if (!from.held) {
        const to = element.getBoundingClientRect();
        const dx = from.rect.left - to.left;
        const dy = from.rect.top - to.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          element.animate(
            [
              { transform: `translate(${dx}px, ${dy}px)` },
              { transform: "translate(0, 0)" },
            ],
            { duration: 260, easing: EASE },
          );
        }
      }
    } else if (first && (enterOnLoad || !isSettling())) {
      element.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 320,
          easing: EASE,
          delay: isSettling() ? delay : 0,
          fill: "backwards",
        },
      );
    }
  });
}
