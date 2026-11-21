import type { ReactNode } from "react";
import type { Components, ExtraProps } from "react-markdown";

import { asTaskState } from "../lib/tasks";
import { MermaidBlock } from "./diagram/MermaidBlock";
import { MathView } from "./math/MathView";
import { TaskItem } from "./task/TaskItem";

import markdownClasses from "./markdown.module.css";
import tableLook from "./table/look.module.css";

type PreProps = ExtraProps;

// The source of a ```mermaid fence, or undefined for any other element.
function mermaidSource(node: PreProps["node"]): string | undefined {
  const code = node?.children[0];
  if (code?.type !== "element" || code.tagName !== "code") {
    return undefined;
  }
  const names = code.properties["className"];
  if (!Array.isArray(names) || !names.includes("language-mermaid")) {
    return undefined;
  }
  return code.children
    .map(child => (child.type === "text" ? child.value : ""))
    .join("");
}

// The formula of a `$$` block (remark-math makes it a code element in a pre).
function mathSource(node: PreProps["node"]): string | undefined {
  const code = node?.children[0];
  if (code?.type !== "element" || code.tagName !== "code") {
    return undefined;
  }
  const names = code.properties["className"];
  if (!Array.isArray(names) || !names.includes("language-math")) {
    return undefined;
  }
  return code.children
    .map(child => (child.type === "text" ? child.value : ""))
    .join("");
}

function textOf(children: ReactNode): string {
  return typeof children === "string" ? children : "";
}

export const components: Components = {
  pre: ({ node, children }) => {
    const formula = mathSource(node);
    if (formula !== undefined) {
      return <MathView tex={formula.trim()} display />;
    }
    const source = mermaidSource(node);
    return source === undefined ? (
      <pre>{children}</pre>
    ) : (
      <MermaidBlock source={source} />
    );
  },
  // `$x$` (a `$$` block is a pre, above).
  code: ({ node: _node, className, children }) =>
    className?.split(" ").includes("language-math") === true ? (
      <MathView tex={textOf(children).trim()} display={false} />
    ) : (
      <code className={className}>{children}</code>
    ),
  li: ({ node, children }) => {
    const state = asTaskState(node?.properties["dataTask"]);
    // A number when our plugin sets it, a string once the HTML step has parsed
    // the tree again (see rehypeHtml).
    const raw = node?.properties["dataOffset"];
    const offset = typeof raw === "string" ? Number(raw) : raw;
    return state !== undefined &&
      typeof offset === "number" &&
      Number.isFinite(offset) ? (
      <TaskItem state={state} offset={offset}>
        {children}
      </TaskItem>
    ) : (
      <li>{children}</li>
    );
  },
  // The same frame and look as the table editor.
  table: ({ node: _node, children }) => (
    <div className={`${tableLook.frame} ${markdownClasses.tableBox}`}>
      <table className={tableLook.table}>{children}</table>
    </div>
  ),
  summary: ({ node: _node, children, className }) => (
    // The header of a foldable callout: the click folds it and must not also
    // open the card around it.
    <summary
      className={className}
      onClick={event => {
        event.stopPropagation();
      }}
    >
      {children}
    </summary>
  ),
  a: ({ node: _node, children, href }) => (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  ),
};
