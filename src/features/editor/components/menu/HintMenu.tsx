import { Menu } from "@mantine/core";

import type { HintsState } from "../../hooks/useHints";
import { isPrompt } from "../../lib/hints";
import { Anchor } from "./Anchor";
import { HighlightItems } from "./HighlightItems";
import { MENU_FIT } from "./keep";
import { TaskStateItems } from "./TaskStateItems";

const TITLES = {
  task: "Kind of task",
  "colour-open": "Colour of the highlight",
  "colour-inside": "Highlight colour",
};

// The menu that opens above the caret where a colour or a kind of task can be
// picked (see useHints). It never takes the focus: the caret stays in the
// text, and the keys are given to it through the editor.
export function HintMenu({ state }: { state: HintsState }) {
  const { shown, active, pickTask, pickHue } = state;
  const hint = shown?.hint;
  // The keys only work while it is a question, not just a place to change.
  const keyed = hint !== undefined && isPrompt(hint);
  return (
    <Menu
      opened={shown !== undefined}
      position="top-start"
      shadow="md"
      width={190}
      trapFocus={false}
      returnFocus={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      closeOnItemClick={false}
      middlewares={MENU_FIT}
    >
      <Menu.Target>
        <Anchor x={shown?.x ?? 0} y={shown?.y ?? 0} />
      </Menu.Target>
      <Menu.Dropdown
        onMouseDown={event => {
          event.preventDefault();
        }}
      >
        <Menu.Label>{hint === undefined ? "" : TITLES[hint.kind]}</Menu.Label>
        {hint?.kind === "task" ? (
          <TaskStateItems
            current={undefined}
            active={keyed ? active : undefined}
            onPick={task => {
              pickTask(hint, task);
            }}
          />
        ) : (
          <HighlightItems
            current={
              hint?.kind === "colour-inside" ? hint.found.hue : undefined
            }
            active={keyed ? active : undefined}
            onPick={hue => {
              if (hint !== undefined) {
                pickHue(hint, hue);
              }
            }}
          />
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
