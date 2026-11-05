import type { DragLayer } from "./dragLayer";
import { flash, releaseHeld, wasConsumed } from "./flip";

// How many frames to wait for the app to commit a drop before concluding
// that nothing moved.
const COMMIT_WAIT_FRAMES = 6;

// Once dropped, wait for the app to commit the move. The clone then flies to
// where the item ended up and levels out, in the layer above the board, so
// the tilt is never cropped by a scrolling column or the stage. The item
// stays unseen until the clone has landed on it. If nothing moved, the clone
// glides back to where the item was.
export function settle(
  layer: DragLayer,
  key: string,
  element: HTMLElement,
  done: () => void,
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
      layer.glideBack(element.getBoundingClientRect(), finish);
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
