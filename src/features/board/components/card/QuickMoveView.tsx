import { ChevronLeft } from "lucide-react";

import { sortedColumns } from "../../lib/mutations";
import type { Card } from "../../lib/types";
import { useBoardStore } from "../../stores/boardStore";
import { ActionButton } from "../actions/ActionButton";

// The quick-edit menu's second view: the columns the card can move to.
export function QuickMoveView({
  card,
  onMove,
  onBack,
}: {
  card: Card;
  onMove: (columnId: string) => void;
  onBack: () => void;
}) {
  const columns = useBoardStore(state => state.columns);
  return (
    <>
      <ActionButton
        icon={<ChevronLeft size={15} />}
        label="Move to…"
        onClick={onBack}
      />
      {sortedColumns({ columns }).map(column => (
        <ActionButton
          key={column.id}
          label={column.name}
          disabled={column.id === card.columnId}
          onClick={() => {
            onMove(column.id);
          }}
        />
      ))}
    </>
  );
}
