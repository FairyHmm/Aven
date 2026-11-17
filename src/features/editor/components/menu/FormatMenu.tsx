import { Menu } from "@mantine/core";
import {
  Bold,
  Code,
  Highlighter,
  Italic,
  RemoveFormatting,
  Sigma,
  Strikethrough,
  Type,
} from "lucide-react";

import { clearFormat } from "../../lib/format/clear";
import type { Command } from "../../lib/format/edit";
import { toggleHighlight } from "../../lib/format/highlight";
import { type Mark, toggleMark } from "../../lib/format/inline";
import { type ShortcutId, shortcutLabel } from "../../lib/format/shortcuts";
import type { Active } from "../../lib/format/state";
import { HighlightItems } from "./HighlightItems";
import { SubMenu } from "./SubMenu";
import { Tail } from "./Tail";

const MARKS: {
  mark: Mark;
  label: string;
  icon: typeof Bold;
  keys?: ShortcutId;
}[] = [
  { mark: "bold", label: "Bold", icon: Bold, keys: "bold" },
  { mark: "italic", label: "Italic", icon: Italic, keys: "italic" },
  {
    mark: "strike",
    label: "Strikethrough",
    icon: Strikethrough,
    keys: "strike",
  },
];

type Props = {
  run: (command: Command) => void;
  // What the text is now, for the checks.
  active: Active | undefined;
};

// Bold, italic, strikethrough, highlight (in every colour), code and math, on
// the selection or the word under the caret, and clearing them again. Marks
// only: a table cell has this menu too.
export function FormatMenu({ run, active }: Props) {
  const has = (mark: Mark) => active?.marks.includes(mark) === true;
  return (
    <SubMenu icon={<Type size={14} />} label="Format">
      {MARKS.map(({ mark, label, icon: Icon, keys }) => (
        <Menu.Item
          key={mark}
          leftSection={<Icon size={14} />}
          rightSection={
            <Tail
              on={has(mark)}
              hint={keys === undefined ? undefined : shortcutLabel(keys)}
            />
          }
          onClick={() => {
            run(toggleMark(mark));
          }}
        >
          {label}
        </Menu.Item>
      ))}
      <SubMenu
        icon={<Highlighter size={14} />}
        label="Highlight"
        tail={<Tail on={active?.hue !== undefined} />}
      >
        <HighlightItems
          current={active?.hue}
          onPick={hue => {
            run(toggleHighlight(hue));
          }}
        />
      </SubMenu>
      <Menu.Item
        leftSection={<Code size={14} />}
        rightSection={<Tail on={has("code")} hint={shortcutLabel("code")} />}
        onClick={() => {
          run(toggleMark("code"));
        }}
      >
        Code
      </Menu.Item>
      <Menu.Item
        leftSection={<Sigma size={14} />}
        rightSection={<Tail on={has("math")} />}
        onClick={() => {
          run(toggleMark("math"));
        }}
      >
        Math
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        leftSection={<RemoveFormatting size={14} />}
        onClick={() => {
          run(clearFormat);
        }}
      >
        Clear formatting
      </Menu.Item>
    </SubMenu>
  );
}
