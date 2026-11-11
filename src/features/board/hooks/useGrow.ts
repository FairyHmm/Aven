import { type RefObject, useLayoutEffect } from "react";

import { EASE } from "../../../shared/lib/dnd/flip";
import { ms } from "../../../shared/lib/motion";

// The height a card's tile had when it was removed, for the tile that takes
// its place (a tile turns into its editor and back: two components).
const left = new Map<string, number>();

// Animates tile height changes (content growth, inline edit, etc.).
export function useGrow(
  tile: RefObject<HTMLElement | null>,
  inner: RefObject<HTMLElement | null>,
  // Card id, used to hand off height when one tile replaces another.
  id?: string,
  enabled = true,
) {
  useLayoutEffect(() => {
    const outer = tile.current;
    const content = inner.current;
    if (!enabled || outer === null || content === null) {
      return undefined;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Padding and border around the content.
    const chrome = outer.offsetHeight - content.offsetHeight;
    let target = content.offsetHeight + chrome;
    let animation: Animation | undefined;

    const run = (from: number, to: number) => {
      animation?.cancel();
      if (reduced || Math.abs(from - to) < 1) {
        animation = undefined;
        outer.style.removeProperty("overflow");
        outer.style.removeProperty("height");
        return;
      }
      // Held at where it starts, so that not even one frame shows it already
      // there before the animation takes over.
      outer.style.overflow = "hidden";
      outer.style.height = `${from}px`;
      const own = outer.animate(
        [{ height: `${from}px` }, { height: `${to}px` }],
        { duration: ms("base"), easing: EASE },
      );
      animation = own;
      own.onfinish = () => {
        if (animation === own) {
          animation = undefined;
          outer.style.removeProperty("overflow");
          outer.style.removeProperty("height");
        }
      };
    };

    // It took the place of a tile that was taller or shorter.
    const before = id === undefined ? undefined : left.get(id);
    if (id !== undefined) {
      left.delete(id);
    }
    if (before !== undefined) {
      run(before, target);
    }

    const observer = new ResizeObserver(() => {
      const next = content.offsetHeight + chrome;
      if (Math.abs(next - target) < 1) {
        return;
      }
      // From where it is right now if it is on its way somewhere; otherwise
      // from the height it had, as the layout has already moved on.
      const from =
        animation === undefined ? target : outer.getBoundingClientRect().height;
      target = next;
      run(from, next);
    });
    observer.observe(content);
    return () => {
      observer.disconnect();
      if (id !== undefined) {
        left.set(id, outer.getBoundingClientRect().height);
      }
      animation?.cancel();
      outer.style.removeProperty("overflow");
      outer.style.removeProperty("height");
    };
  }, [tile, inner, id, enabled]);
}
