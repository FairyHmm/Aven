import { type MantineTransition, Transition } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { type ReactNode, useCallback, useEffect, useRef } from "react";

import { ms } from "../../../shared/lib/motion";
import type { ViewSwitch } from "../hooks/useViewSwitch";

const FADE: MantineTransition = {
  in: { opacity: 1 },
  out: { opacity: 0 },
  transitionProperty: "opacity",
};

const EASE = "cubic-bezier(0.2, 0, 0, 1)";

// The view of a popup or menu that is showing (see useViewSwitch): when
// another is asked for, this one fades out first, and the next fades in.
export function ViewFade<T>({
  switcher,
  transition = FADE,
  enter = ms("fast"),
  exit = ms("fast"),
  morph = false,
  className,
  children,
}: {
  switcher: ViewSwitch<T>;
  // How a view comes and goes, and how long each takes. A menu whose buttons
  // come in on their own animation has no enter of its own (0).
  transition?: MantineTransition;
  enter?: number;
  exit?: number;
  // The popup grows or shrinks (rather than jumps) to the size of the next
  // view, while the views fade.
  morph?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  // The height the box holds while one view has left and the next has not come.
  const held = useRef<number>(undefined);

  useEffect(() => {
    if (morph && !switcher.open && box.current !== null) {
      held.current = box.current.offsetHeight;
      box.current.style.height = `${held.current}px`;
      box.current.style.overflow = "hidden";
    }
  }, [morph, switcher.open]);

  useEffect(() => {
    const element = content.current;
    const outer = box.current;
    if (!morph || element === null || outer === null) {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      const next = element.offsetHeight;
      const from = held.current;
      if (next === 0 || from === undefined) {
        return;
      }
      held.current = undefined;
      const release = () => {
        outer.style.removeProperty("height");
        outer.style.removeProperty("overflow");
      };
      if (reduced || Math.abs(from - next) < 1) {
        release();
        return;
      }
      outer.style.height = `${next}px`;
      outer.animate([{ height: `${from}px` }, { height: `${next}px` }], {
        duration: ms("base"),
        easing: EASE,
      }).onfinish = release;
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [morph, reduced]);

  // A view that comes in takes the focus where it asks for it (a field marked
  // data-autofocus): the one before it, that had the focus, is gone.
  const focusFirst = useCallback((node: HTMLDivElement | null) => {
    node?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, []);

  const view = (
    <Transition
      mounted={switcher.open}
      transition={transition}
      duration={reduced ? 0 : enter}
      exitDuration={reduced ? 0 : exit}
      timingFunction={EASE}
      onExited={switcher.exited}
    >
      {styles => (
        <div ref={focusFirst} className={className} style={styles}>
          {children}
        </div>
      )}
    </Transition>
  );
  return morph ? (
    <div ref={box}>
      <div ref={content}>{view}</div>
    </div>
  ) : (
    view
  );
}
