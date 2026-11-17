import { useOpenedCard } from "../../hooks/useCardEditor";
import { CardBack } from "./CardBack";

// The modal of whichever card is open (see stores/editorStore.ts); renders
// nothing while none is.
export function CardEditorModal() {
  const { card, close } = useOpenedCard();
  if (card === undefined) {
    return null;
  }
  return <CardBack key={card.id} card={card} onClose={close} />;
}
