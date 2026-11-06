import { Menu } from "@mantine/core";
import { Check } from "lucide-react";
import {
  createContext,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from "react";

import { pressControl } from "../../../shared/lib/dnd/press";
import { isRound, TASK_STATES, type TaskState, toggled } from "../lib/tasks";
import { TaskMark } from "./TaskMark";

import classes from "./task.module.css";

// Set by a MarkdownView that can write changes back; without it the boxes are
// read-only.
export const TaskContext = createContext<
  ((offset: number, state: TaskState) => void) | undefined
>(undefined);

// Nothing in here may reach the card tile around it: a click would open the
// editor and Enter/Space on the box would too.
function contained(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation();
}

type Props = { state: TaskState; offset: number; children: ReactNode };

export function TaskItem({ state, offset, children }: Props) {
  const change = useContext(TaskContext);
  const [open, setOpen] = useState(false);
  // The state under the pointer in the menu: shown on the box (and the text)
  // until the pointer moves on, but never written.
  const [preview, setPreview] = useState<TaskState>();
  const pressed = useRef(false);
  const shown = preview ?? state;
  // The glyph only pops in once the box has changed after mounting, so a page
  // full of tasks doesn't animate on load.
  const [last, setLast] = useState(shown);
  const [changed, setChanged] = useState(false);
  if (last !== shown) {
    setLast(shown);
    setChanged(true);
  }
  const label = TASK_STATES.find(item => item.char === shown)?.label ?? "";

  return (
    <li className={classes.task}>
      <Menu
        opened={open}
        onChange={next => {
          setOpen(next);
          if (!next) {
            setPreview(undefined);
          }
        }}
        position="bottom-start"
        shadow="md"
        width={190}
        disabled={change === undefined}
      >
        <Menu.Target>
          <span className={classes.target}>
            <button
              type="button"
              role="checkbox"
              aria-checked={
                state === "x" ? true : state === " " ? false : "mixed"
              }
              aria-label={label}
              title={label}
              className={classes.box}
              data-state={shown}
              data-shape={isRound(shown) ? "round" : "icon"}
              data-animate={changed ? "" : undefined}
              data-open={open ? "" : undefined}
              disabled={change === undefined}
              onPointerLeave={() => {
                pressed.current = false;
              }}
              onPointerUp={() => {
                // Toggle on release rather than on `click`: a click is not
                // reliably delivered to a button inside a draggable item.
                if (pressed.current) {
                  pressed.current = false;
                  change?.(offset, toggled(state));
                }
              }}
              onClick={event => {
                contained(event);
                // Mouse and touch toggled on release; this is the keyboard
                // (Enter/Space), which reports no click position.
                if (event.detail === 0) {
                  change?.(offset, toggled(state));
                }
              }}
              onKeyDown={contained}
              onPointerDown={event => {
                // Only the primary button presses the box; a right click
                // opens the menu and must not toggle it.
                if (event.button !== 0) {
                  return;
                }
                pressed.current = true;
                pressControl(event, () => {
                  change?.(offset, toggled(state));
                });
              }}
              onContextMenu={event => {
                event.preventDefault();
                contained(event);
                setOpen(true);
              }}
            >
              <TaskMark key={shown} state={shown} />
            </button>
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
          {TASK_STATES.map(item => (
            <Menu.Item
              key={item.char}
              leftSection={
                <span
                  className={classes.glyph}
                  data-state={item.char}
                  data-shape={isRound(item.char) ? "round" : "icon"}
                >
                  <TaskMark state={item.char} />
                </span>
              }
              rightSection={item.char === state ? <Check size={14} /> : null}
              onMouseEnter={() => {
                setPreview(item.char);
              }}
              onFocus={() => {
                setPreview(item.char);
              }}
              onClick={() => {
                change?.(offset, item.char);
              }}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      <div className={classes.content}>{children}</div>
    </li>
  );
}
