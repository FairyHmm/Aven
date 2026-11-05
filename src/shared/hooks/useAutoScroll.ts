import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { useEffect, type RefObject } from "react";

// Scrolls the element when an item is dragged near its edge. Attach it to
// each scrollable container (the lane, a column's card list, the sidebar).
export function useAutoScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    return element === null ? undefined : autoScrollForElements({ element });
  }, [ref]);
}
