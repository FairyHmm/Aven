// Motion helpers for the board. Before a mutation is applied the current
// position of every [data-flip] element is captured; after React commits, each
// element that moved (or moved to another column and remounted) animates from
// its old position to its new one (FLIP), so cards glide instead of jumping.
//
// A card being dragged is represented by a floating clone (dragLayer.ts).
// Its position is "held" here, so the dragged card is captured at the clone
// rather than at its own (hidden) place, and the clone lands on the card once
// the move is committed (settle.ts) instead of the card gliding by itself.

export type From = {
  rect: DOMRect;
  // True for the position of a dragged item's clone: that item is landed by
  // the clone (see settle.ts) instead of gliding from here.
  held: boolean;
};

let captured = new Map<string, From>();
let consumed = new Set<string>();
const held = new Map<string, From>();
let clearTimer: number | undefined;
let loadedAt = 0;

export const EASE = "cubic-bezier(0.2, 0, 0, 1)";

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function holdRect(key: string, from: From): void {
  held.set(key, from);
}

export function releaseHeld(key: string): void {
  held.delete(key);
}

export function captureLayout(): void {
  captured = new Map();
  consumed = new Set();
  for (const element of document.querySelectorAll<HTMLElement>("[data-flip]")) {
    const key = element.dataset.flip;
    // The dragged item (and everything inside it) is represented by its drag
    // clone, which is "held" below: it has no position of its own to glide
    // from.
    if (key !== undefined && element.closest("[data-dragging]") === null) {
      captured.set(key, {
        rect: element.getBoundingClientRect(),
        held: false,
      });
    }
  }
  for (const [key, from] of held) {
    captured.set(key, from);
  }
  window.clearTimeout(clearTimer);
  clearTimer = window.setTimeout(() => {
    captured = new Map();
  }, 500);
}

export function takeFrom(key: string): From | undefined {
  const from = captured.get(key);
  if (from !== undefined) {
    captured.delete(key);
    consumed.add(key);
  }
  return from;
}

// True once a committed render has picked up the held position of `key`.
export function wasConsumed(key: string): boolean {
  return consumed.has(key);
}

// A soft ring that fades out on whatever just landed, so the eye finds it.
export function flash(element: Element): void {
  const target = element.firstElementChild ?? element;
  target.animate(
    [
      {
        outline:
          "2px solid color-mix(in oklab, var(--color-primary-hover) 70%, transparent)",
        outlineOffset: "1px",
      },
      {
        outline: "2px solid transparent",
        outlineOffset: "1px",
      },
    ],
    { duration: 700, easing: EASE },
  );
}

// A board just finished loading: its first paint gets a staggered entrance.
export function markLoaded(): void {
  loadedAt = performance.now();
}

export function isSettling(): boolean {
  return performance.now() - loadedAt < 800;
}
