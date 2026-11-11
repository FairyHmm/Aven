// Glides and exits for changes that move things without re-rendering them
// (see flip.ts for the capture of where everything was).

import { flushSync } from "react-dom";

import { ms } from "../motion";
import {
  captureLayout,
  EASE,
  type From,
  prefersReducedMotion,
  takeFrom,
} from "./flip";

// Glides whatever moved since captureLayout, and was not already glided by
// its own re-render (useFlip).
//
// An item in a vertical list that changed height (data-flip-grow) grows or
// shrinks from its old height to its new one, and the items under it follow
// as the list reflows. That animation starts before anything else is
// measured, so what it moves is not counted again as a move of its own. All
// the remaining positions are measured before any glide starts. An element
// inside another one that glides only glides the part its parent does not
// already carry it by, so nested [data-flip] elements do not move twice.
function glideCaptured(): void {
  const found: { element: HTMLElement; from: From }[] = [];
  for (const element of document.querySelectorAll<HTMLElement>("[data-flip]")) {
    const key = element.dataset.flip;
    const from = key === undefined ? undefined : takeFrom(key);
    if (from !== undefined && !from.held) {
      found.push({ element, from });
    }
  }
  for (const { element, from } of found) {
    if (element.dataset.flipGrow === undefined) {
      continue;
    }
    const height = element.getBoundingClientRect().height;
    if (Math.abs(from.rect.height - height) > 1) {
      element.animate(
        [
          { height: `${from.rect.height}px`, overflow: "hidden" },
          { height: `${height}px`, overflow: "hidden" },
        ],
        { duration: ms("base"), easing: EASE },
      );
    }
  }
  const delta = new Map<HTMLElement, { dx: number; dy: number }>();
  for (const { element, from } of found) {
    const to = element.getBoundingClientRect();
    delta.set(element, {
      dx: from.rect.left - to.left,
      dy: from.rect.top - to.top,
    });
  }
  const carried = (element: HTMLElement) => {
    for (
      let parent = element.parentElement?.closest<HTMLElement>("[data-flip]");
      parent !== null && parent !== undefined;
      parent = parent.parentElement?.closest<HTMLElement>("[data-flip]")
    ) {
      const own = delta.get(parent);
      if (own !== undefined) {
        return own;
      }
    }
    return { dx: 0, dy: 0 };
  };
  const moves: { element: HTMLElement; dx: number; dy: number }[] = [];
  for (const [element, own] of delta) {
    const by = carried(element);
    const dx = own.dx - by.dx;
    const dy = own.dy - by.dy;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      moves.push({ element, dx, dy });
    }
  }
  for (const { element, dx, dy } of moves) {
    element.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: ms("base"), easing: EASE },
    );
  }
}

// A picture of something that is leaving the page, left where it was and
// faded out: the element itself is already gone (or about to be), and what
// was around it has moved on. It takes no clicks and is hidden from screen
// readers.
function ghostAt(source: Element, rect: DOMRect): void {
  if (prefersReducedMotion()) {
    return;
  }
  const ghost = source.cloneNode(true);
  if (!(ghost instanceof HTMLElement)) {
    return;
  }
  // Keys and ids belong to the real thing, not its picture.
  for (const node of [ghost, ...ghost.querySelectorAll<HTMLElement>("*")]) {
    node.removeAttribute("data-flip");
    node.removeAttribute("data-leave");
    node.removeAttribute("id");
  }
  ghost.inert = true;
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    boxSizing: "border-box",
    margin: "0",
    zIndex: "1000",
    pointerEvents: "none",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  document.body.append(ghost);
  const out = ghost.animate(
    [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0, transform: "scale(0.94)" },
    ],
    {
      duration: ms("base"),
      easing: "cubic-bezier(0.3, 0, 0.8, 0.15)",
      fill: "forwards",
    },
  );
  out.onfinish = () => {
    ghost.remove();
  };
}

// The tile (or column) with this [data-flip] key is about to be removed:
// leave its picture behind to fade out while the rest closes up.
export function ghostOut(key: string): void {
  const element = document.querySelector(`[data-flip="${CSS.escape(key)}"]`);
  if (element !== null) {
    ghostAt(element, element.getBoundingClientRect());
  }
}

// For a change that moves things without re-rendering them (a section added
// to the card back, a row of properties above the text): the change is
// committed right here, so that what moved can be measured and glided before
// the next paint, and whatever marked [data-leave] it removed fades out where
// it was. Call it from an event handler.
export function glideAround(change: () => void): void {
  if (prefersReducedMotion()) {
    change();
    return;
  }
  const leaving = [
    ...document.querySelectorAll<HTMLElement>("[data-leave]"),
  ].map(element => ({ element, rect: element.getBoundingClientRect() }));
  captureLayout();
  flushSync(change);
  glideCaptured();
  const gone = leaving.filter(({ element }) => !element.isConnected);
  for (const { element, rect } of gone) {
    // A section that goes takes its chips with it: one picture is enough.
    if (
      !gone.some(
        other => other.element !== element && other.element.contains(element),
      )
    ) {
      ghostAt(element, rect);
    }
  }
}

// The same for a change made in a store: React commits it on its own, and
// the glide runs in the next frame, before the paint.
export function captureAndGlide(): void {
  if (prefersReducedMotion()) {
    return;
  }
  captureLayout();
  requestAnimationFrame(glideCaptured);
}
