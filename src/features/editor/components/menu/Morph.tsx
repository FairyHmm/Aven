import { type ReactNode, useLayoutEffect, useRef } from "react";

import { ms } from "../../../../shared/lib/motion";

// A submenu grows out of the item that opened it: its box starts as that
// item's and settles into its own, in width and height both, while what is
// inside stays at its size and fades in. Put inside a submenu's dropdown.
export function Morph({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const content = inner.current;
    const box = content?.closest<HTMLElement>("[data-menu-dropdown]");
    if (
      content === null ||
      box === null ||
      box === undefined ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }
    // Its own size, before anything is done to it. It stays out of sight until
    // it has been placed, so that it does not show at full size first.
    const size = box.getBoundingClientRect();
    const fixed = content.getBoundingClientRect().width;
    box.style.opacity = "0";
    let animation: Animation | undefined;
    const frame = requestAnimationFrame(() => {
      box.style.removeProperty("opacity");
      // Mantine gives the item the id the dropdown's is made from.
      const item = document.getElementById(box.id.replace(/-dropdown$/, ""));
      if (item === null) {
        return;
      }
      const from = item.getBoundingClientRect();
      const to = box.getBoundingClientRect();
      content.style.width = `${fixed}px`;
      animation = box.animate(
        [
          {
            width: `${from.width}px`,
            height: `${from.height}px`,
            translate: `${from.left - to.left}px ${from.top - to.top}px`,
            overflow: "hidden",
          },
          {
            width: `${size.width}px`,
            height: `${size.height}px`,
            translate: "0 0",
            overflow: "hidden",
          },
        ],
        {
          duration: ms("base"),
          easing:
            getComputedStyle(document.documentElement)
              .getPropertyValue("--ease")
              .trim() || "ease-out",
        },
      );
      content.animate(
        [{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }],
        {
          duration: ms("base"),
          easing: "linear",
        },
      );
      animation.onfinish = () => {
        content.style.removeProperty("width");
      };
    });
    return () => {
      cancelAnimationFrame(frame);
      animation?.cancel();
      box.style.removeProperty("opacity");
    };
  }, []);
  return <div ref={inner}>{children}</div>;
}
