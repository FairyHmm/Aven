import type { Ref } from "react";
import { createPortal } from "react-dom";

type Props = {
  x: number;
  y: number;
  ref?: Ref<HTMLSpanElement>;
};

// A point to hang a menu on, in the page (not inside whatever the editor sits
// in, which may move or clip it). Mantine gives it the ref.
export function Anchor({ x, y, ref }: Props) {
  return createPortal(
    <span
      ref={ref}
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: 0,
        height: 0,
        pointerEvents: "none",
      }}
    />,
    document.body,
  );
}
