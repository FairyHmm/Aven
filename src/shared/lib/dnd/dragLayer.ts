import { ms } from "../motion";
import { EASE, holdRect } from "./flip";

export type DragLayer = {
  move: (x: number, y: number) => void;
  // Stop following the pointer; the clone stays where it is.
  freeze: () => void;
  // Fly the clone to `to`, levelling out, then call `done`.
  glideBack: (to: DOMRect, done: () => void) => void;
  remove: () => void;
};

const FOLLOW = 0.38; // how tightly the clone chases the pointer (1 = glued)
const TILT_PER_PX = 0.9; // degrees of tilt per px of horizontal speed per frame
const TILT_MAX = 14;
const TILT_EASE = 0.18;

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
  const body = node.querySelector<HTMLElement>("[data-drag-body]") ?? node;
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
    transition: "none",
    transformOrigin: `${origin.x}px ${origin.y}px`,
    willChange: "transform",
  });
  document.body.append(node);

  let x = box.left;
  let y = box.top;
  let targetX = x;
  let targetY = y;
  let tilt = 0;
  let frame = 0;

  const render = () => {
    node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg)`;
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
    remove: () => {
      cancelAnimationFrame(frame);
      node.remove();
    },
  };
}
