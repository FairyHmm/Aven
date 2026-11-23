import { SortableItem } from "../../../../shared/components/SortableItem";
import { useCanEdit } from "../../hooks/useCanEdit";
import { useIsEditing } from "../../hooks/useCardEditor";
import { useNarrowed } from "../../hooks/useNarrowed";
import type { Card } from "../../lib/types";
import { CardTile } from "./CardTile";

type Props = {
  card: Card;
  columnId: string;
  // Position in the column and the column's length: needed to open the gap.
  index: number;
  count: number;
};

// A card's place in its column. A card being edited is only grabbed by the
// row under its editor, so dragging inside the text selects it instead of lifting the card.
export function CardSlot({ card, columnId, index, count }: Props) {
  const editing = useIsEditing(card.id);
  const canEdit = useCanEdit();
  const narrowed = useNarrowed();
  return (
    <SortableItem
      kind="card"
      id={card.id}
      listId={columnId}
      axis="vertical"
      index={index}
      count={count}
      disabled={editing || narrowed || !canEdit}
    >
      <CardTile card={card} />
    </SortableItem>
  );
}
