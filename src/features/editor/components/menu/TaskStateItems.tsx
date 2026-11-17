import { Menu } from "@mantine/core";

import { isRound, TASK_STATES, type TaskState } from "../../lib/tasks";
import { TaskMark } from "../task/TaskMark";
import { Tail } from "./Tail";

import glyphStyles from "../task/glyph.module.css";

type Props = {
  // The state the task has now, for the check.
  current: TaskState | undefined;
  onPick: (state: TaskState) => void;
  // The pointer or the keys are on this state (the box shows it meanwhile).
  onPreview?: ((state: TaskState) => void) | undefined;
  // The item the keys are on (its place in the list), if the menu has keys.
  active?: number | undefined;
};

// The states of a checkbox, as menu items, with their own glyphs: in the
// Paragraph menu of the editor and in the menu of a box.
export function TaskStateItems({ current, onPick, onPreview, active }: Props) {
  return TASK_STATES.map((item, index) => (
    <Menu.Item
      key={item.char}
      data-menu-active={active === index ? true : undefined}
      leftSection={
        <span
          className={glyphStyles.glyph}
          data-state={item.char}
          data-shape={isRound(item.char) ? "round" : "icon"}
        >
          <TaskMark state={item.char} />
        </span>
      }
      rightSection={<Tail on={current === item.char} />}
      onMouseEnter={() => {
        onPreview?.(item.char);
      }}
      onFocus={() => {
        onPreview?.(item.char);
      }}
      onClick={() => {
        onPick(item.char);
      }}
    >
      {item.label}
    </Menu.Item>
  ));
}
