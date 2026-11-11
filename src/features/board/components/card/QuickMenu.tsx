import { type MantineTransition } from "@mantine/core";
import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ms } from "../../../../shared/lib/motion";
import { useAnchorRect } from "../../hooks/useAnchorRect";
import { useLeaveGhost } from "../../hooks/useLeaveGhost";
import { useViewSwitch } from "../../hooks/useViewSwitch";
import { cardsOf } from "../../lib/mutations";
import type { Card, Props } from "../../lib/types";
import { useBoardStore } from "../../stores/boardStore";
import { ViewFade } from "../ViewFade";
import { QuickMainView } from "./QuickMainView";
import { QuickMoveView } from "./QuickMoveView";

import classes from "./quickMenu.module.css";

// A view of the menu goes back into the tile, as its buttons do when the menu
// closes; the next one comes out on the buttons' own animation.
const LEAVE: MantineTransition = {
  in: { opacity: 1, transform: "translateX(0) scale(1)" },
  out: { opacity: 0, transform: "translateX(var(--slide)) scale(0.9)" },
  common: { transformOrigin: "var(--origin)" },
  transitionProperty: "opacity, transform",
};

const WIDTH = 212;
const GAP = 8;

type Menu = {
  card: Card;
  // Something inside the tile; the menu sits beside the tile around it.
  anchor: RefObject<HTMLElement | null>;
  // Save what was typed, then close the editor.
  finish: () => void;
  // The card's properties as edited so far, and how the popups change them.
  props: Props;
  onProps: (props: Props) => void;
};

// Quick-edit menu shown beside the card tile while editing in place.
export function QuickMenu({ card, anchor, finish, props, onProps }: Menu) {
  const rect = useAnchorRect(anchor);
  const switcher = useViewSwitch<"main" | "move">("main");
  const { view } = switcher;
  const menu = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  useLeaveGhost(host);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    setHeight(menu.current?.offsetHeight ?? 0);
  }, [rect, view]);
  const { moveCard } = useBoardStore(state => state.actions);

  if (rect === undefined) {
    return null;
  }
  // Beside the tile on the right, or on its left near the screen edge.
  const flipped = rect.right + GAP + WIDTH > window.innerWidth - GAP;
  const left = flipped
    ? Math.max(GAP, rect.left - GAP - WIDTH)
    : rect.right + GAP;

  // Level with the tile, but never below the bottom of the screen.
  const top = Math.max(
    GAP,
    Math.min(rect.top, window.innerHeight - height - GAP),
  );

  const move = (columnId: string) => {
    const count = cardsOf(useBoardStore.getState(), columnId).length;
    finish();
    moveCard(card.id, columnId, count);
  };

  return createPortal(
    <div ref={host} className={classes.host}>
      <div
        className={classes.scrim}
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      />
      <div
        ref={menu}
        className={classes.menu}
        // The actions slide out from the tile, so which side it is on matters.
        data-side={flipped ? "left" : "right"}
        style={{ left, top, width: WIDTH }}
        // Part of the tile as far as ending the edit is concerned; a press here
        // must not take focus away from the text either.
        data-keep-editing=""
        onMouseDown={event => {
          // Not for the popups, which are children of the menu only as far as
          // React is concerned: their fields need the focus.
          if (
            event.target instanceof Node &&
            event.currentTarget.contains(event.target)
          ) {
            event.preventDefault();
          }
        }}
      >
        <ViewFade
          switcher={switcher}
          className={classes.view}
          transition={LEAVE}
          enter={0}
          exit={ms("fast")}
        >
          {view === "main" ? (
            <QuickMainView
              card={card}
              props={props}
              onProps={onProps}
              finish={finish}
              onMove={() => {
                switcher.go("move");
              }}
            />
          ) : (
            <QuickMoveView
              key="move"
              card={card}
              onMove={move}
              onBack={() => {
                switcher.go("main");
              }}
            />
          )}
        </ViewFade>
      </div>
    </div>,
    document.body,
  );
}
