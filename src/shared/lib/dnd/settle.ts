import { ms } from "../motion";
import type { DragLayer } from "./dragLayer";
import { EASE, flash, releaseHeld, wasConsumed } from "./flip";

// How many frames to wait for the app to commit a drop before concluding
// that nothing moved.
const COMMIT_WAIT_FRAMES = 6;

// Once dropped, wait for the app to commit the move. The clone then flies to
// where the item ended up and levels out, in the layer above the board, so
// the tilt is never cropped by a scrolling column or the stage. The item
// stays unseen until the clone has landed on it. If nothing moved, the clone
// glides back to where the item was. If it was dropped on a sink (a button)
// and the item shows up nowhere, the clone is drawn into the button instead,
// which gives a little pulse.
export function settle(
  layer: DragLayer,
  key: string,
  element: HTMLElement,
  done: () => void,
  sink?: HTMLElement,
) {
  const finish = () => {
    // The item shows before the clone goes, so nothing blinks in between.
    done();
    layer.remove();
    releaseHeld(key);
  };
  const land = () => {
    // A move to another list remounts the item, so find it again by its key.
    const landed =
      document.querySelector<HTMLElement>(`[data-flip="${CSS.escape(key)}"]`) ??
      element;
    landed.style.visibility = "hidden";
    layer.glideBack(landed.getBoundingClientRect(), () => {
      landed.style.removeProperty("visibility");
      finish();
      flash(landed);
    });
  };
  const poll = (frame: number) => {
    if (wasConsumed(key)) {
      land();
    } else if (frame >= COMMIT_WAIT_FRAMES) {
      if (sink === undefined) {
        layer.glideBack(element.getBoundingClientRect(), finish);
      } else {
        layer.absorb(sink.getBoundingClientRect(), () => {
          finish();
          pulse(sink);
        });
      }
    } else {
      requestAnimationFrame(() => {
        poll(frame + 1);
      });
    }
  };
  requestAnimationFrame(() => {
    poll(0);
  });
}

// The button that took an item in gives a little pulse.
function pulse(element: HTMLElement) {
  element.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.25)", offset: 0.4 },
      { transform: "scale(1)" },
    ],
    { duration: ms("base") * 1.5, easing: EASE },
  );
}
