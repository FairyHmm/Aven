import { createContext, type ReactNode, useContext } from "react";

import type { TaskState } from "../../lib/tasks";
import { TaskBox } from "./TaskBox";

import task from "./task.module.css";

// Set by a MarkdownView that can write changes back; without it the boxes are
// read-only.
export const TaskContext = createContext<
  ((offset: number, state: TaskState) => void) | undefined
>(undefined);

type Props = { state: TaskState; offset: number; children: ReactNode };

export function TaskItem({ state, offset, children }: Props) {
  const change = useContext(TaskContext);
  return (
    <li
      className={task.task}
      data-task=""
      data-cancelled={state === "-" ? "" : undefined}
    >
      <TaskBox
        state={state}
        onChange={
          change === undefined
            ? undefined
            : next => {
                change(offset, next);
              }
        }
      />
      <div className={task.content}>{children}</div>
    </li>
  );
}
