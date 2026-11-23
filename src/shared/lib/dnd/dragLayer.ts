import { useDragStore } from "../../stores/dragStore";
import { ms } from "../motion";
import { EASE, holdRect } from "./flip";

export type DragLayer = {
  move: (x: number, y: number) => void;
  // Stop following the pointer; the clone stays where it is.
  freeze: () => void;
  // Fly the clone to `to`, levelling out, then call `done`.
  glideBack: (to: DOMRect, done: () => void) => void;
  // Draw the clone into `to` (a button that took it in): it shrinks to
  // nothing around the point it was held by, which ends on the middle of
  // `to`, and fades; then call `done`.
  absorb: (to: DOMRect, done: () => void) => void;
  remove: () => void;
};

const FOLLOW = 0.38; // how tightly the clone chases the pointer (1 = glued)
const TILT_PER_PX = 0.9; // degrees of tilt per px of horizontal speed per frame
const TILT_MAX = 14;
const TILT_EASE = 0.18;
const SINK_SCALE = 0.55; // how small it gets over a button that takes it in
const SINK_EASE = 0.22;

const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));

// The floating card that follows the pointer while dragging. It chases the
// pointer with a little lag and swings about the point you grabbed it by,
// tilting in the direction of travel and settling flat when you stop.
// Native drag images can't animate, so the real drag image is disabled and
// this clone replaces it.
export function createDragLayer(
  source: HTMLElement,
  key: string,
  pointer: { x: number; y: number },
): DragLayer | undefined {
  const box = source.getBoundingClientRect();
  const node = source.cloneNode(true);
  if (!(node instanceof HTMLElement)) {
    return undefined;
  }
  const origin = { x: pointer.x - box.left, y: pointer.y - box.top };

  // The clone must not be mistaken for the real thing (FLIP capture, drop
  // geometry), on itself or on anything nested inside it.
  for (const element of [
    node,
    ...node.querySelectorAll("[data-flip], [data-sortable-item]"),
  ]) {
    for (const attribute of [
      "data-flip",
      "data-sortable-item",
      "data-dragging",
    ]) {
      element.removeAttribute(attribute);
    }
  }
  // What only matters in place (the controls of a row that is not its text) is
  // left out of the picture, and the shadow goes on the part that is the thing
  // itself: a row is dragged as its bar, not as the room around it. They are
  // hidden, not removed, so the bar keeps the size it has in the list: it does
  // not stretch over their room when lifted, or shrink back on landing.
  for (const element of node.querySelectorAll<HTMLElement>(
    "[data-drag-hide]",
  )) {
    element.style.visibility = "hidden";
  }
  // The part the shadow and outline go on: what marks itself as the body or,
  // failing that, the item's own box if it has rounded corners (the wrapper
  // around a card has none, and a shadow or outline on it shows square
  // corners around the card's round ones).
  const inner = node.firstElementChild;
  const rounded =
    source.firstElementChild instanceof HTMLElement &&
    getComputedStyle(source.firstElementChild).borderTopLeftRadius !== "0px";
  const body =
    node.querySelector<HTMLElement>("[data-drag-body]") ??
    (rounded && inner instanceof HTMLElement ? inner : node);
  body.style.boxShadow =
    "0 18px 32px -10px rgb(0 0 0 / 0.6), 0 2px 6px rgb(0 0 0 / 0.3)";
  Object.assign(node.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${box.width}px`,
    margin: "0",
    zIndex: "1000",
    pointerEvents: "none",
    opacity: "1",
    // Only the opacity eases by transition (see setSinking); the position,
    // tilt and size are worked out frame by frame.
    transition: "opacity var(--dur) var(--ease)",
    transformOrigin: `${origin.x}px ${origin.y}px`,
    willChange: "transform",
  });
  document.body.append(node);

  // While the pointer is over a button that would take the item in (a sink in
  // the drag store), the clone shrinks around the point it is held by, turns a
  // little see-through and wears an outline: it is over the button (and would
  // hide its highlight), and this says what letting go will do. It eases back
  // when the pointer leaves. It follows the store, not the pointer's own
  // events: the sink only gets into the store after the item's handler ran.
  // The size is part of the transform (about the held point, like the tilt):
  // the `scale` property would apply outside the translation and pull the card
  // toward the corner it is positioned from.
  let shrink = 1;
  let shrinkTarget = 1;
  const setSinking = (sinking: boolean) => {
    shrinkTarget = sinking ? SINK_SCALE : 1;
    node.style.opacity = sinking ? "0.8" : "1";
    body.style.outline = sinking
      ? "2px solid var(--color-primary-hover)"
      : "none";
  };
  const stopFollowing = useDragStore.subscribe(state => {
    setSinking(state.sink !== undefined);
  });

  let x = box.left;
  let y = box.top;
  let targetX = x;
  let targetY = y;
  let tilt = 0;
  let frame = 0;

  const render = () => {
    node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg) scale(${shrink})`;
    holdRect(key, {
      rect: new DOMRect(x, y, box.width, box.height),
      held: true,
    });
  };

  const tick = () => {
    const nextX = x + (targetX - x) * FOLLOW;
    const speed = nextX - x;
    x = nextX;
    y += (targetY - y) * FOLLOW;
    tilt += (clamp(speed * TILT_PER_PX, TILT_MAX) - tilt) * TILT_EASE;
    shrink += (shrinkTarget - shrink) * SINK_EASE;
    render();
    frame = requestAnimationFrame(tick);
  };
  render();
  frame = requestAnimationFrame(tick);

  return {
    move: (nextX, nextY) => {
      targetX = nextX - origin.x;
      targetY = nextY - origin.y;
    },
    freeze: () => {
      // Dropped: the drop is about to clear the store, which would un-shrink
      // a card that is about to be drawn into the button.
      stopFollowing();
      cancelAnimationFrame(frame);
    },
    glideBack: (to, done) => {
      const animation = node.animate(
        [
          { transform: node.style.transform },
          {
            transform: `translate3d(${to.left}px, ${to.top}px, 0) rotate(0deg)`,
          },
        ],
        { duration: ms("base"), easing: EASE, fill: "forwards" },
      );
      animation.onfinish = done;
    },
    absorb: (to, done) => {
      const endX = to.left + to.width / 2 - origin.x;
      const endY = to.top + to.height / 2 - origin.y;
      const animation = node.animate(
        [
          { transform: node.style.transform },
          {
            transform: `translate3d(${endX}px, ${endY}px, 0) rotate(0deg) scale(0.1)`,
            opacity: 0,
          },
        ],
        { duration: ms("base"), easing: EASE, fill: "forwards" },
      );
      animation.onfinish = done;
    },
    remove: () => {
      stopFollowing();
      cancelAnimationFrame(frame);
      node.remove();
    },
  };
}
