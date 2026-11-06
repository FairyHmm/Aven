// A small control inside a draggable item (a checkbox on a card) is pressed
// with a few pixels of jitter, and the browser starts a native drag after only
// 3-4px, which would swallow the click. So a press on such a control is
// registered here: the item then treats the drag as "pending" and only lifts
// once the pointer has moved `LIFT_DISTANCE`. If it is dropped before that,
// it was a click, and the control's own action runs instead.
export const LIFT_DISTANCE = 6;

export type Press = { x: number; y: number; onClick: () => void };

let press: Press | undefined;

export function pressControl(
  point: { clientX: number; clientY: number },
  onClick: () => void,
): void {
  press = { x: point.clientX, y: point.clientY, onClick };
  // A plain click never starts a drag; the control's own click handler runs.
  window.addEventListener(
    "pointerup",
    () => {
      press = undefined;
    },
    { once: true, capture: true },
  );
}

// Called when a drag starts: hands over (and forgets) the press that led to it.
export function takePress(): Press | undefined {
  const taken = press;
  press = undefined;
  return taken;
}

// Items whose drag has started but not lifted yet. Lists ignore them, so no
// gap opens for something that has not left its place.
const pending = new WeakSet<Element>();

export const pendingDrag = {
  add: (element: Element) => pending.add(element),
  delete: (element: Element) => pending.delete(element),
  has: (element: Element) => pending.has(element),
};
