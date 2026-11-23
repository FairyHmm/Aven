import { ms } from "../motion";
import { EASE, flash } from "./flip";

const LIFTED = "0 18px 32px -10px rgb(0 0 0 / 0.6), 0 2px 6px rgb(0 0 0 / 0.3)";

// Degrees of lean per px travelled sideways, and the most it leans.
const TILT_PER_PX = 0.05;
const TILT_MAX = 12;

const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));

// A moved item that crosses the board (a card undone back to another column)
// flies in the layer above it, like a dropped card, instead of gliding in
// place: in place it would be cropped by the scrolling column or stage it
// moves inside of. A picture of it leaves where it was and lands where it is
// now, while the item itself stays unseen (but in place, so it keeps the focus)
// until the picture arrives.
export function fly(element: HTMLElement, from: DOMRect, to: DOMRect): void {
  const picture = element.cloneNode(true);
  if (!(picture instanceof HTMLElement)) {
    return;
  }
  // The picture must not be mistaken for the real thing (FLIP capture, drop
  // geometry).
  for (const part of [
    picture,
    ...picture.querySelectorAll("[data-flip], [data-sortable-item]"),
  ]) {
    for (const name of ["data-flip", "data-sortable-item", "data-dragging"]) {
      part.removeAttribute(name);
    }
  }
  Object.assign(picture.style, {
    position: "fixed",
    left: `${to.left}px`,
    top: `${to.top}px`,
    width: `${to.width}px`,
    height: `${to.height}px`,
    margin: "0",
    zIndex: "1000",
    pointerEvents: "none",
    transition: "none",
    visibility: "visible",
  });
  // A card with the keyboard focus travels with its focus ring, so the ring
  // doesn't vanish for the flight and come back at the end.
  const tile = element.firstElementChild;
  const ringed = tile?.matches(":focus-visible") === true;
  if (
    tile instanceof HTMLElement &&
    picture.firstElementChild instanceof HTMLElement
  ) {
    if (ringed) {
      const ring = getComputedStyle(tile);
      picture.firstElementChild.style.outline = ring.outline;
      picture.firstElementChild.style.outlineOffset = ring.outlineOffset;
    }
  }
  document.body.append(picture);
  // Unseen, not `visibility: hidden`: a hidden element drops the focus, and a
  // card moved by key must keep it.
  const shown = element.style.opacity;
  element.style.opacity = "0";

  const duration = ms("base") * 1.5;
  const lift = picture.firstElementChild ?? picture;
  lift.animate(
    [
      { boxShadow: LIFTED },
      { boxShadow: LIFTED, offset: 0.7 },
      { boxShadow: "0 0 0 transparent" },
    ],
    { duration, easing: EASE },
  );
  // Like the drag picture, it swings about a point near the top and leans
  // the way it travels (more for a longer way), then levels out as it lands.
  const tilt = clamp((to.left - from.left) * TILT_PER_PX, TILT_MAX);
  picture.style.transformOrigin = `${to.width * 0.35}px ${Math.min(to.height * 0.3, 40)}px`;
  picture.animate(
    [
      { rotate: "0deg" },
      { rotate: `${tilt}deg`, offset: 0.4 },
      { rotate: "0deg" },
    ],
    { duration, easing: "ease-in-out" },
  );
  const flight = picture.animate(
    [
      { translate: `${from.left - to.left}px ${from.top - to.top}px` },
      { translate: "0 0" },
    ],
    { duration, easing: EASE },
  );
  flight.onfinish = () => {
    element.style.opacity = shown;
    picture.remove();
    flash(element);
  };
}
