import { useCanEdit } from "../../hooks/useCanEdit";
import { useOpenedCard } from "../../hooks/useCardEditor";
import { CardBack } from "./CardBack";
import { CardReadOnly } from "./CardReadOnly";

// The modal of whichever card is open (see stores/editorStore.ts); renders
// nothing while none is. People who may only read get a read-only view.
export function CardEditorModal() {
  const { card, close } = useOpenedCard();
  const canEdit = useCanEdit();
  if (card === undefined) {
    return null;
  }
  return canEdit ? (
    <CardBack key={card.id} card={card} onClose={close} />
  ) : (
    <CardReadOnly key={card.id} card={card} onClose={close} />
  );
}
