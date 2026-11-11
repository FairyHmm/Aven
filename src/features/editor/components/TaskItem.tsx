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

import task from "./task.module.css";
import boxStyles from "./taskBox.module.css";
import glyphStyles from "./taskGlyph.module.css";

// Set by a MarkdownView that can write changes back; without it the boxes are
// read-only.
export const TaskContext = createContext<
  ((offset: number, state: TaskState) => void) | undefined
>(undefined);

function contained(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation();
}

type Props = { state: TaskState; offset: number; children: ReactNode };

export function TaskItem({ state, offset, children }: Props) {
  const change = useContext(TaskContext);
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
  const cancelled = shown === "-";
  const reveal = open || pressed.current;

  return (
    <li
      className={task.task}
      data-task=""
      data-cancelled={cancelled ? "" : undefined}
    >
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
        disabled={change === undefined}
      >
        <Menu.Target>
          <span
            className={task.target}
            data-empty={empty ? "" : undefined}
            data-reveal={empty && reveal ? "" : undefined}
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={
                state === "x" ? true : state === " " ? false : "mixed"
              }
              aria-label={label}
              title={label}
              className={boxStyles.box}
              data-state={shown}
              data-shape={isRound(shown) ? "round" : "icon"}
              data-animate={changed ? "" : undefined}
              data-open={open ? "" : undefined}
              disabled={change === undefined}
              onPointerLeave={() => {
                pressed.current = false;
              }}
              onPointerUp={() => {
                if (pressed.current) {
                  pressed.current = false;
                  change?.(offset, toggled(state));
                }
              }}
              onClick={event => {
                contained(event);
                if (event.detail === 0) {
                  change?.(offset, toggled(state));
                }
              }}
              onKeyDown={contained}
              onPointerDown={event => {
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
                contextMenu.current = true;
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
                  className={glyphStyles.glyph}
                  data-state={item.char}
                  data-shape={isRound(item.char) ? "round" : "icon"}
                >
                  <TaskMark state={item.char} />
                </span>
              }
              rightSection={item.char === state ? <Check size={14} /> : null}
              onMouseEnter={() => {
                if (open) setPreview(item.char);
              }}
              onFocus={() => {
                if (open) setPreview(item.char);
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
      <div className={task.content}>{children}</div>
    </li>
  );
}
