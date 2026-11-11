import { type RefObject, useLayoutEffect, useRef } from "react";

import { prefersReducedMotion } from "../../../shared/lib/dnd/flip";

const GHOST_MS = 700;

// Lets something that is removed from the page leave with a transition: when
// the component unmounts, a copy of the element is put in the page, marked
// `data-leaving` for the stylesheet to animate out, and removed again. The
// copy is only a picture (it takes no clicks and is hidden from screen
// readers). React's StrictMode unmounts and mounts straight away in
// development; the copy is dropped when that happens.
export function useLeaveGhost(
  ref: RefObject<HTMLElement | null>,
  // The element is not fixed on the page itself (a button inside a tile): the
  // copy is put where it was, on top of whatever takes its place.
  pin = false,
) {
  const mounted = useRef(false);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const node = ref.current;
      if (node === null || prefersReducedMotion()) {
        return;
      }
      const ghost = node.cloneNode(true);
      if (pin && ghost instanceof HTMLElement) {
        const box = node.getBoundingClientRect();
        Object.assign(ghost.style, {
          position: "fixed",
          boxSizing: "border-box",
          margin: "0",
          zIndex: "240",
          left: `${box.left}px`,
          top: `${box.top}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
        });
      }
      queueMicrotask(() => {
        if (!mounted.current && ghost instanceof HTMLElement) {
          ghost.setAttribute("data-leaving", "");
          ghost.setAttribute("aria-hidden", "true");
          document.body.append(ghost);
          window.setTimeout(() => {
            ghost.remove();
          }, GHOST_MS);
        }
      });
    };
  }, [ref, pin]);
}
