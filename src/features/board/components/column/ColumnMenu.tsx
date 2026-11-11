import { ActionIcon, Menu } from "@mantine/core";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";

import { ACCENTS, type Accent } from "../../lib/types";

import classes from "./columnMenu.module.css";

type Props = {
  accent: Accent;
  onRename: () => void;
  onAccent: (accent: Accent) => void;
  onDelete: () => void;
};

export function ColumnMenu({ accent, onRename, onAccent, onDelete }: Props) {
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
