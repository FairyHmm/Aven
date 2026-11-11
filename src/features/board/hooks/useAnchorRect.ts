import { type RefObject, useEffect, useState } from "react";
import { flushSync } from "react-dom";

// Where the tile around `anchor` is on screen, kept up to date while the page
// scrolls, resizes or the tile grows with its text. (A passive effect: the
// anchor is a parent's element, and its ref is only attached once the layout
// effects of its children, which is where this used to run, are done.)
export function useAnchorRect(anchor: RefObject<HTMLElement | null>) {
  const [rect, setRect] = useState<DOMRect>();
  useEffect(() => {
    const tile = anchor.current?.closest<HTMLElement>("[data-editing]");
    if (tile === null || tile === undefined) {
      return undefined;
    }
    const update = () => {
      setRect(tile.getBoundingClientRect());
    };
    // Whatever follows the tile (the dim) must be in the same frame as the
    // tile, not the one after: render now, before the browser paints.
    const follow = () => {
      flushSync(update);
    };
    update();
    const observer = new ResizeObserver(follow);
    observer.observe(tile);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", follow, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", follow, true);
    };
  }, [anchor]);
  return rect;
}
