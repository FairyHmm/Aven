import { useRef, useState } from "react";

// A popup or menu with more than one view: `go` leaves the current view (it
// fades out, see ViewFade), and when it has left, `exited` brings in the new
// one. `jump` changes the view without a transition, for a popup that is
// closed anyway.
export function useViewSwitch<T>(initial: T) {
  const [view, setView] = useState(initial);
  const [open, setOpen] = useState(true);
  const next = useRef<{ view: T } | undefined>(undefined);
  return {
    view,
    open,
    go: (to: T) => {
      next.current = { view: to };
      setOpen(false);
    },
    jump: (to: T) => {
      next.current = undefined;
      setView(to);
      setOpen(true);
    },
    exited: () => {
      const pending = next.current;
      if (pending !== undefined) {
        next.current = undefined;
        setView(pending.view);
        setOpen(true);
      }
    },
  };
}

export type ViewSwitch<T> = ReturnType<typeof useViewSwitch<T>>;
