import { useReducedMotion } from "@mantine/hooks";
import { type ReactNode, useLayoutEffect, useRef } from "react";

import { ms } from "../lib/motion";

// Fades its content in whenever `page` changes (and when it first mounts), so
// a new page arrives softly instead of popping in. It animates the wrapper
// rather than remounting the content, so the router's outlet is left alone.
export function PageFade({
  page,
  children,
}: {
  page: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null || reduceMotion) {
      return undefined;
    }
    const animation = el.animate(
      [
        { opacity: 0, transform: "translateY(6px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: ms("base") + 60, easing: "cubic-bezier(0.2, 0, 0, 1)" },
    );
    return () => {
      animation.cancel();
    };
  }, [page, reduceMotion]);

  return <div ref={ref}>{children}</div>;
}
