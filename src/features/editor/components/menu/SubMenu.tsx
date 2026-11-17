import { Menu } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { KEEP } from "./keep";
import { Morph } from "./Morph";

import classes from "./menu.module.css";

// A submenu lives inside its parent's box, which would clip and cap it; the
// page is what it has to fit in.
const FIT = {
  flip: { boundary: document.documentElement, padding: 5 },
  shift: { boundary: document.documentElement, padding: 5 },
};

type Props = {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  // Shown before the arrow: a check when something inside is on.
  tail?: ReactNode;
  children: ReactNode;
};

// An item that opens a submenu to its side.
export function SubMenu({
  icon,
  label,
  disabled = false,
  tail,
  children,
}: Props) {
  return (
    <Menu.Sub closeDelay={120} middlewares={FIT}>
      <Menu.Sub.Target>
        <Menu.Sub.Item
          leftSection={icon}
          disabled={disabled}
          rightSection={
            tail === undefined ? undefined : (
              <span className={classes.tail}>
                {tail}
                <ChevronRight size={14} />
              </span>
            )
          }
        >
          {label}
        </Menu.Sub.Item>
      </Menu.Sub.Target>
      <Menu.Sub.Dropdown
        {...KEEP}
        onContextMenu={event => {
          event.preventDefault();
        }}
      >
        <Morph>{children}</Morph>
      </Menu.Sub.Dropdown>
    </Menu.Sub>
  );
}
