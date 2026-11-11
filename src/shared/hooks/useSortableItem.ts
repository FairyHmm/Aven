import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { disableNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview";
import { useEffect, useRef, useState, type RefObject } from "react";
import { flushSync } from "react-dom";

import {
  itemData,
  liftedSize,
  type Axis,
  type Collapse,
  type Phase,
} from "../lib/dnd/data";
import { createDragLayer, type DragLayer } from "../lib/dnd/dragLayer";
import {
  LIFT_DISTANCE,
  pendingDrag,
  takePress,
  type Press,
} from "../lib/dnd/press";
import { settle } from "../lib/dnd/settle";
import { useDragStore } from "../stores/dragStore";

type Options = {
  kind: string;
  id: string;
  listId: string;
  axis: Axis;
  // Position in the list, where the drop preview starts.
  index: number;
  // CSS selector (inside the item) of the part you grab it by. Default: all.
  handle?: string | undefined;
  disabled?: boolean | undefined;
};

// A drag takes the pointer away from whatever was being typed into. Blurring
// it first lets that field save (and shrink back) before the item is measured
// and lifted.
function releaseFocus(element: HTMLElement) {
  const focused = document.activeElement;
  const typing =
    focused instanceof HTMLElement &&
    (focused.isContentEditable ||
      focused instanceof HTMLInputElement ||
      focused instanceof HTMLTextAreaElement);
  if (typing && element.contains(focused)) {
    flushSync(() => {
      focused.blur();
    });
  }
}

// Makes an element draggable. The browser's drag image is replaced by a
// floating clone that swings with the pointer (see dragLayer.ts).
export function useSortableItem(
  ref: RefObject<HTMLElement | null>,
  { kind, id, listId, axis, index, handle, disabled = false }: Options,
) {
  const layer = useRef<DragLayer | undefined>(undefined);
  const waiting = useRef<Press | undefined>(undefined);
  const locked = useRef(disabled);
  const place = useRef({ axis, index });
  // dragging: collapsed out of the list (a clone follows the pointer).
  // settling: dropped; back to full size but unseen until the clone lands.
  const [phase, setPhase] = useState<Phase>("idle");
  const [collapse, setCollapse] = useState<Collapse | undefined>(undefined);
  locked.current = disabled;
  place.current = { axis, index };

  useEffect(() => {
    const element = ref.current;
    if (element === null) {
      return undefined;
    }
    const key = `${kind}:${id}`;
    const grip = handle === undefined ? null : element.querySelector(handle);
    const lift = (clientX: number, clientY: number) => {
      const { axis: direction, index: from } = place.current;
      const vertical = direction === "vertical";
      // Measure and clone before the item starts collapsing. Fractional
      // sizes: rounding them would nudge the neighbours by a sub-pixel.
      const box = element.getBoundingClientRect();
      const { width, height } = box;
      liftedSize.set(element, { width, height });
      layer.current = createDragLayer(element, key, {
        x: clientX,
        y: clientY,
      });
      // The item gives back its size plus the list's gap, while the room
      // for the drop opens right where it was: the pointer starts over its
      // own slot, so the two cancel out and the neighbours stay put.
      const parent = element.parentElement;
      const style = parent === null ? undefined : getComputedStyle(parent);
      const spacing = Number.parseFloat(
        (vertical ? style?.rowGap : style?.columnGap) ?? "0",
      );
      const gap = Number.isNaN(spacing) ? 0 : spacing;
      const size = vertical ? height : width;
      // First at full size (so the collapse has something to animate
      // from), then, after a style flush, shrunk to nothing: the box really
      // shrinks, so it can't stretch the list's scrollable area, and its
      // size plus the list's gap is given back as the drop room opens.
      flushSync(() => {
        setCollapse({ size, gap, shrunk: false });
        setPhase("dragging");
        // Start the preview over the item's own slot, unless the list has
        // already measured the pointer: that is more accurate, and
        // overwriting it would flip the gap back for a moment.
        const store = useDragStore.getState();
        if (store.listId === undefined) {
          store.setTarget(kind, listId, from + 1, size + gap, from);
        }
      });
      element.getBoundingClientRect();
      flushSync(() => {
        setCollapse({ size, gap, shrunk: true });
      });
    };
    return draggable({
      element,
      ...(grip === null ? {} : { dragHandle: grip }),
      canDrag: () => !locked.current,
      getInitialData: () => itemData({ kind, id, listId }),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        disableNativeDragPreview({ nativeSetDragImage });
      },
      onDragStart: ({ location }) => {
        releaseFocus(element);
        const held = takePress();
        if (held !== undefined) {
          // Pressed on a small control: wait for real movement (see press.ts).
          waiting.current = held;
          pendingDrag.add(element);
          return;
        }
        const { clientX, clientY } = location.current.input;
        lift(clientX, clientY);
      },
      onDrag: ({ location }) => {
        const { clientX, clientY } = location.current.input;
        const held = waiting.current;
        if (held !== undefined) {
          if (Math.hypot(clientX - held.x, clientY - held.y) < LIFT_DISTANCE) {
            return;
          }
          // Moved far enough: lift from where the press was, so the clone
          // starts on the item and catches up with the pointer.
          waiting.current = undefined;
          pendingDrag.delete(element);
          lift(held.x, held.y);
        }
        layer.current?.move(clientX, clientY);
      },
      onDrop: () => {
        const held = waiting.current;
        if (held !== undefined) {
          // Dropped without ever lifting: it was a click on the control.
          waiting.current = undefined;
          pendingDrag.delete(element);
          held.onClick();
          return;
        }
        const current = layer.current;
        layer.current = undefined;
        if (current === undefined) {
          setPhase("idle");
          return;
        }
        current.freeze();
        // Back to full size (so its new place is measured), but unseen until
        // the clone has landed on it.
        setPhase("settling");
        settle(current, key, element, () => {
          // Synchronous, so the item is on screen before the clone is removed.
          flushSync(() => {
            setPhase("idle");
          });
        });
      },
    });
  }, [ref, kind, id, listId, handle]);

  return { phase, collapse: phase === "dragging" ? collapse : undefined };
}
