import { useEffect } from "react";

import type { PopupKind } from "../lib/types";
import { useEditorStore } from "../stores/editorStore";

// A card the keyboard is on: the tile under the pointer, or the focused one.
function targetCard(): string | undefined {
  const { hoveredId } = useEditorStore.getState();
  if (hoveredId !== undefined) {
    return hoveredId;
  }
  const focused = document.activeElement;
  return focused instanceof HTMLElement
    ? focused.closest<HTMLElement>("[data-card-id]")?.dataset.cardId
    : undefined;
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement)
  );
}

const POPUP_KEYS: Record<string, PopupKind> = {
  l: "labels",
  d: "dates",
  m: "members",
};

// Card hotkeys: `e` edit, `l` labels, `d` dates, `m` members. While editing
// (and focus isn't in a text field), `l`/`d`/`m` open that popup.
export function useQuickEditKey() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const plain = !(event.ctrlKey || event.metaKey || event.altKey);
      const { openId, editingId, edit, setPopup } = useEditorStore.getState();
      if (!plain || isTyping(event.target) || openId !== undefined) {
        return;
      }
      const key = event.key.toLowerCase();
      const popup = POPUP_KEYS[key];
      if (editingId !== undefined) {
        if (popup !== undefined) {
          event.preventDefault();
          setPopup(popup);
        }
        return;
      }
      if (key !== "e" && popup === undefined) {
        return;
      }
      const id = targetCard();
      if (id !== undefined) {
        event.preventDefault();
        edit(id, popup);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
