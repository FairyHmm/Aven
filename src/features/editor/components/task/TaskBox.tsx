import { Menu, Tooltip } from "@mantine/core";
import { type KeyboardEvent, type MouseEvent, useRef, useState } from "react";

import { pressControl } from "../../../../shared/lib/dnd/press";
import { isRound, TASK_STATES, type TaskState, toggled } from "../../lib/tasks";
import { TaskStateItems } from "../menu/TaskStateItems";
import { TaskMark } from "./TaskMark";

import boxStyles from "./box.module.css";
import task from "./task.module.css";

// A boolean data attribute: present (empty) or absent.
const flag = (on: boolean) => (on ? "" : undefined);

function contained(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation();
}

type BoxProps = {
  state: TaskState;
  // Undefined: the box is read-only.
  onChange: ((state: TaskState) => void) | undefined;
  // Show an unchecked box although its row is not hovered (the editor's caret
  // is on the row).
  active?: boolean;
  // In the editor a right click goes to its menu, not to one of the box.
  onMenu?: ((x: number, y: number) => void) | undefined;
};

// The task checkbox and its right-click menu of states, for a list item of the
// read view and for the line of the editor alike.
export function TaskBox({ state, onChange, active = false, onMenu }: BoxProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<TaskState>();
  const pressed = useRef(false);
  const contextMenu = useRef(false);
  // Only show preview while the menu is open; late hover/focus during fade-out
  // must not leave a stale preview on the box.
  const shown = open ? (preview ?? state) : state;
  const [last, setLast] = useState(shown);
  const [changed, setChanged] = useState(false);
  if (last !== shown) {
    setLast(shown);
    setChanged(true);
  }
  const label = TASK_STATES.find(item => item.char === shown)?.label ?? "";
  const empty = shown === " ";
  const reveal = open || pressed.current || active;
  // Made already revealed (a new line): it comes in once. Revealed later (a
  // hover, a click on the line), it only transitions.
  const [fresh] = useState(empty && reveal);

  return (
    <Menu
      opened={open}
      onChange={next => {
        // Only open from an explicit context menu; left click toggles the box.
        if (next) {
          if (!contextMenu.current) {
            return;
          }
          contextMenu.current = false;
        }
        setOpen(next);
        // Clear preview on both open and close so nothing stale carries over.
        setPreview(undefined);
      }}
      position="bottom-start"
      shadow="md"
      width={190}
      disabled={onChange === undefined}
    >
      <Menu.Target>
        <span
          className={task.target}
          data-empty={flag(empty)}
          data-reveal={flag(empty && reveal)}
          data-fresh={flag(fresh)}
        >
          <Tooltip label={label} openDelay={450} position="top">
            <button
              type="button"
              role="checkbox"
              aria-checked={
                state === "x" ? true : state === " " ? false : "mixed"
              }
              aria-label={label}
              className={boxStyles.box}
              data-state={shown}
              data-shape={isRound(shown) ? "round" : "icon"}
              data-animate={flag(changed)}
              data-open={flag(open)}
              data-active={flag(active)}
              data-fresh={flag(fresh)}
              disabled={onChange === undefined}
              onPointerLeave={() => {
                pressed.current = false;
              }}
              onPointerUp={() => {
                if (pressed.current) {
                  pressed.current = false;
                  onChange?.(toggled(state));
                }
              }}
              onClick={event => {
                contained(event);
                if (event.detail === 0) {
                  onChange?.(toggled(state));
                }
              }}
              onKeyDown={contained}
              onPointerDown={event => {
                if (event.button !== 0) {
                  return;
                }
                pressed.current = true;
                pressControl(event, () => {
                  onChange?.(toggled(state));
                });
              }}
              onContextMenu={event => {
                event.preventDefault();
                contained(event);
                if (onMenu !== undefined) {
                  onMenu(event.clientX, event.clientY);
                  return;
                }
                contextMenu.current = true;
                setOpen(true);
              }}
            >
              <TaskMark key={shown} state={shown} />
            </button>
          </Tooltip>
        </span>
      </Menu.Target>
      <Menu.Dropdown
        onClick={contained}
        onKeyDown={contained}
        onContextMenu={contained}
        onMouseLeave={() => {
          setPreview(undefined);
        }}
      >
        <TaskStateItems
          current={state}
          onPick={next => {
            onChange?.(next);
          }}
          onPreview={next => {
            if (open) setPreview(next);
          }}
        />
      </Menu.Dropdown>
    </Menu>
  );
}
