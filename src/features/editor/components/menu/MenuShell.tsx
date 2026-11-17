import { Menu } from "@mantine/core";
import type { ReactNode } from "react";

import { Anchor } from "./Anchor";
import { KEEP, MENU_FIT } from "./keep";

type Props = {
  opened: boolean;
  onClose: () => void;
  // Where it hangs, in viewport pixels.
  x: number;
  y: number;
  children: ReactNode;
};

// The right-click menu both editors use: a dropdown hung on a point, which
// belongs to the card being edited and closes without closing it.
export function MenuShell({ opened, onClose, x, y, children }: Props) {
  return (
    <Menu
      opened={opened}
      onChange={next => {
        if (!next) {
          onClose();
        }
      }}
      position="bottom-start"
      shadow="md"
      width={190}
      middlewares={MENU_FIT}
    >
      <Menu.Target>
        <Anchor x={x} y={y} />
      </Menu.Target>
      <Menu.Dropdown
        {...KEEP}
        onContextMenu={event => {
          event.preventDefault();
        }}
      >
        {children}
      </Menu.Dropdown>
    </Menu>
  );
}
