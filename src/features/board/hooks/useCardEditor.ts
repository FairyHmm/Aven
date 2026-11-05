import { useBoardStore } from "../stores/boardStore";
import { useEditorStore } from "../stores/editorStore";

// Opens the editor for a card. The function never changes, so a card tile
// calling this doesn't re-render when the editor opens or closes.
export function useOpenCard() {
  return useEditorStore(state => state.open);
}

// The card whose editor is open, if any, and how to close it.
export function useEditedCard() {
  const cardId = useEditorStore(state => state.cardId);
  const close = useEditorStore(state => state.close);
  const card = useBoardStore(state =>
    state.cards.find(candidate => candidate.id === cardId),
  );
  return { card, close };
}
