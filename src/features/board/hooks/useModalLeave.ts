import { useEffect, useRef, useState } from "react";

import { ms } from "../../../shared/lib/motion";

// How long the card back takes to leave (the modal's exit duration, a little
// over it): the store only closes it after that, so the exit is seen.
const LEAVE_EXTRA_MS = 20;

export function useModalLeave(onClose: () => void) {
  // The modal is mounted closed and opened a frame later, and closed before
  // it is removed: a modal that is already open when it appears, or that is
  // removed, has no transition to play.
  const [shown, setShown] = useState(false);
  const leaving = useRef<number>(undefined);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setShown(true);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(leaving.current);
    };
  }, []);
  const leave = (after?: () => void) => {
    if (leaving.current === undefined) {
      setShown(false);
      leaving.current = window.setTimeout(
        () => {
          after?.();
          onClose();
        },
        ms("base") + LEAVE_EXTRA_MS,
      );
    }
  };
  return { shown, leave };
}
