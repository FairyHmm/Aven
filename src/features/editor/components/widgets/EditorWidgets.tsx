import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import type { WidgetHub } from "../../lib/widgets/hub";
import { MermaidBlock } from "../diagram/MermaidBlock";
import { MarkdownView } from "../MarkdownView";
import { MathView } from "../math/MathView";
import { TableEditor } from "../table/TableEditor";
import { TaskBox } from "../task/TaskBox";

import classes from "../codeEditor.module.css";

// Draws the widgets CodeMirror reserved room for (task boxes, diagrams,
// formulas, tables, HTML blocks) as React, inside the nodes it made.
export function EditorWidgets({ hub }: { hub: WidgetHub }) {
  const entries = useSyncExternalStore(hub.subscribe, hub.snapshot);
  return (
    <>
      {entries.map(({ id, host, content }) =>
        createPortal(
          content.kind === "task" ? (
            <span className={classes.taskHost}>
              <TaskBox
                state={content.state}
                onChange={content.change}
                active={content.active}
                onMenu={content.menu}
              />
            </span>
          ) : content.kind === "table" ? (
            <TableEditor
              source={content.source}
              change={content.change}
              leave={content.leave}
            />
          ) : content.kind === "html" ? (
            <MarkdownView body={content.source} />
          ) : content.kind === "math" ? (
            <MathView tex={content.tex} display={content.display} />
          ) : (
            <MermaidBlock source={content.source} />
          ),
          host,
          String(id),
        ),
      )}
    </>
  );
}
