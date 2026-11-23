import { ActionIcon, Menu } from "@mantine/core";
import { Archive, ArrowDownUp, Ellipsis, Pencil, Trash2 } from "lucide-react";

import type { SortBy } from "../../lib/columnOps";
import { ACCENTS, type Accent } from "../../lib/types";

import classes from "./columnMenu.module.css";

const SORTS: { by: SortBy; label: string }[] = [
  { by: "title", label: "Title" },
  { by: "due", label: "Due date" },
  { by: "newest", label: "Newest first" },
  { by: "oldest", label: "Oldest first" },
];

type Props = {
  accent: Accent;
  // Whether the column has cards to sort or set aside.
  hasCards: boolean;
  onSort: (by: SortBy) => void;
  onArchiveAll: () => void;
  onRename: () => void;
  onAccent: (accent: Accent) => void;
  onDelete: () => void;
};

export function ColumnMenu({
  accent,
  hasCards,
  onSort,
  onArchiveAll,
  onRename,
  onAccent,
  onDelete,
}: Props) {
  return (
    <Menu
      position="bottom-end"
      shadow="lg"
      radius="md"
      width={196}
      returnFocus={false}
    >
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          radius="md"
          aria-label="Column options"
        >
          <Ellipsis size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<Pencil size={14} />} onClick={onRename}>
          Rename
        </Menu.Item>
        <div className={classes.swatches} role="group" aria-label="Colour">
          {ACCENTS.map(option => (
            <button
              key={option}
              type="button"
              className={classes.swatch}
              data-accent={option}
              data-active={option === accent}
              aria-label={option}
              onClick={() => {
                onAccent(option);
              }}
            />
          ))}
        </div>
        <Menu.Divider />
        {hasCards && (
          <>
            <Menu.Sub>
              <Menu.Sub.Target>
                <Menu.Sub.Item leftSection={<ArrowDownUp size={14} />}>
                  Sort cards
                </Menu.Sub.Item>
              </Menu.Sub.Target>
              <Menu.Sub.Dropdown>
                {SORTS.map(sort => (
                  <Menu.Item
                    key={sort.by}
                    onClick={() => {
                      onSort(sort.by);
                    }}
                  >
                    {sort.label}
                  </Menu.Item>
                ))}
              </Menu.Sub.Dropdown>
            </Menu.Sub>
            <Menu.Item
              leftSection={<Archive size={14} />}
              onClick={onArchiveAll}
            >
              Archive all cards
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        <Menu.Item
          color="red"
          leftSection={<Trash2 size={14} />}
          onClick={onDelete}
        >
          Delete column
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
