import { useEditorStore } from "../stores/editorStore";

// What the board's keyboard shortcuts share.

// Whether the keys are going into a text field: the shortcuts leave them be.
export function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement)
  );
}

// Whether the keys are meant for the board itself: nothing else has the focus
// (a menu, a popover, a button in the toolbar), or a card tile has.
export function isOnBoard(target: EventTarget | null) {
  return (
    target === document.body ||
    (target instanceof Element && target.closest("[data-card-id]") !== null)
  );
}

// A card the keyboard is on: the tile under the pointer, or the focused one.
export function targetCard(): string | undefined {
  const { hoveredId } = useEditorStore.getState();
  if (hoveredId !== undefined) {
    return hoveredId;
  }
  return focusedCard();
}

// The card whose tile has the focus.
export function focusedCard(): string | undefined {
  const focused = document.activeElement;
  return focused instanceof HTMLElement
    ? focused.closest<HTMLElement>("[data-card-id]")?.dataset.cardId
    : undefined;
}

// Puts the focus back on a card once the board has drawn it again: after a
// move to another column its tile is a new element, which may not be there on
// the first frame, so this tries again each frame for a moment.
const FOCUS_TRIES = 60;

export function focusCard(id: string, tries = FOCUS_TRIES) {
  requestAnimationFrame(() => {
    const tile = document.querySelector<HTMLElement>(
      `[data-card-id="${CSS.escape(id)}"]`,
    );
    tile?.focus({ preventScroll: true });
    if (document.activeElement !== tile && tries > 0) {
      focusCard(id, tries - 1);
    } else {
      tile?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  });
}
