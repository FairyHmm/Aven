import { useBoardStore } from "../stores/boardStore";
import { useEditorStore } from "../stores/editorStore";

// The functions never change, so a card tile calling these doesn't re-render
// when some other card is opened or closed.
export function useOpenCard() {
  return useEditorStore(state => state.open);
}

export function useEditCard() {
  return useEditorStore(state => state.edit);
}

export function useHoverCard() {
  return useEditorStore(state => state.hover);
}

export function useCloseCard() {
  return useEditorStore(state => state.close);
}

// Whether this card is the one being edited in place.
export function useIsEditing(id: string) {
  return useEditorStore(state => state.editingId === id);
}

// The card open in the modal, if any, and how to close it.
export function useOpenedCard() {
  const openId = useEditorStore(state => state.openId);
  const close = useEditorStore(state => state.close);
  const card = useBoardStore(state =>
    state.cards.find(candidate => candidate.id === openId),
  );
  return { card, close };
}
