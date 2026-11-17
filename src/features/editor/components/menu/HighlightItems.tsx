import { Menu } from "@mantine/core";

import { shortcutLabel } from "../../lib/format/shortcuts";
import { HUES, type Hue } from "../../lib/highlight/highlights";
import { Tail } from "./Tail";

import classes from "./menu.module.css";

const LABELS: Record<Hue, string> = {
  default: "Default",
  red: "Red",
  orange: "Orange",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  purple: "Purple",
  brown: "Brown",
  gray: "Gray",
  white: "White",
};

type Props = {
  // The colour the text has now, for the check.
  current: Hue | undefined;
  onPick: (hue: Hue) => void;
  // The item the keys are on (its place in the list), if the menu has keys.
  active?: number | undefined;
};

// The colours of a highlight, as menu items: the plain one, then one for each
// circle. In the Format menu and in the popup that opens in a highlight.
export function HighlightItems({ current, onPick, active }: Props) {
  return (
    <>
      <Menu.Item
        data-menu-active={active === 0 ? true : undefined}
        leftSection={<span className={classes.dot} aria-hidden />}
        rightSection={
          <Tail on={current === "default"} hint={shortcutLabel("highlight")} />
        }
        onClick={() => {
          onPick("default");
        }}
      >
        {LABELS.default}
      </Menu.Item>
      {HUES.map(({ hue, emoji }, index) => (
        <Menu.Item
          key={hue}
          data-menu-active={active === index + 1 ? true : undefined}
          leftSection={<span aria-hidden>{emoji}</span>}
          rightSection={<Tail on={current === hue} />}
          onClick={() => {
            onPick(hue);
          }}
        >
          {LABELS[hue]}
        </Menu.Item>
      ))}
    </>
  );
}
