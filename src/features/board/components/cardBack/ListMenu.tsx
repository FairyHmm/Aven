import { Menu } from "@mantine/core";
import { Check, ChevronDown } from "lucide-react";

import { useBoardActions } from "../../hooks/useBoardActions";
import { cardsOf, sortedColumns } from "../../lib/mutations";
import type { Card } from "../../lib/types";
import { useBoardStore } from "../../stores/boardStore";

import classes from "./cardModal.module.css";

// "This Week ▾": which list the card is in; picking another moves it there.
export function ListMenu({ card }: { card: Card }) {
  const columns = useBoardStore(state => state.columns);
  const { moveCard } = useBoardActions();
  const current = columns.find(column => column.id === card.columnId);
  return (
    <Menu position="bottom-start" withinPortal>
      <Menu.Target>
        <button type="button" className={classes.list}>
          {current?.name ?? "List"}
          <ChevronDown size={14} />
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        {sortedColumns({ columns }).map(column => (
          <Menu.Item
            key={column.id}
            leftSection={
              column.id === card.columnId ? <Check size={14} /> : null
            }
            onClick={() => {
              moveCard(
                card.id,
                column.id,
                cardsOf(useBoardStore.getState(), column.id).length,
              );
            }}
          >
            {column.name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
