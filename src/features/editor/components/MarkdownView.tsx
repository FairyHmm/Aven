import { type ReactNode, useCallback } from "react";
import Markdown, {
  type Components,
  type ExtraProps,
  type Options,
} from "react-markdown";
import rehypeCallouts from "rehype-callouts";
import rehypeHighlight from "rehype-highlight";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { remarkHighlight } from "../lib/highlight/remark";
import { rehypeHtml, remarkHtmlOptions } from "../lib/html/sanitize";
import { remarkInlineMath } from "../lib/math/remarkInline";
import { rehypeTableMerge } from "../lib/table/merge";
import { asTaskState, remarkTasks, type TaskState } from "../lib/tasks";
import { MermaidBlock } from "./diagram/MermaidBlock";
import { MathView } from "./math/MathView";
import { TaskContext, TaskItem } from "./task/TaskItem";

import calloutClasses from "./callouts.module.css";
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

const components: Components = {
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

const plugins: NonNullable<Options["remarkPlugins"]> = [
  remarkGfm,
  [remarkMath, { singleDollarTextMath: false }],
  remarkInlineMath,
  remarkFrontmatter,
  remarkTasks,
  remarkHighlight,
];

// Obsidian-style callouts (`> [!note] Title`, `+`/`-` for foldable, GitHub's
// `[!NOTE]` too). The plugin supplies the markup and the lucide icons; the
// look is ours (markdown.module.css), so its class names are replaced with
// the module's. Folding is a native <details>, no script.
const rehypePlugins: NonNullable<Options["rehypePlugins"]> = [
  // HTML first, sanitized; the plugins after it add their own markup.
  ...rehypeHtml,
  [
    rehypeCallouts,
    {
      theme: "obsidian",
      props: {
        containerProps: { className: [calloutClasses.callout] },
        titleProps: { className: [calloutClasses.calloutTitle] },
        titleIconProps: { className: [calloutClasses.calloutIcon] },
        titleTextProps: { className: [calloutClasses.calloutText] },
        foldIconProps: { className: [calloutClasses.calloutFold] },
        contentProps: { className: [calloutClasses.calloutContent] },
      },
    },
  ],
  // Table cells: `^` merges into the cell above, `<` into the one to the left.
  rehypeTableMerge,
  // Fenced code in a named language; mermaid and unknown ones are left alone.
  [rehypeHighlight, { detect: false, ignoreMissing: true }],
];

type Props = {
  body: string;
  // Given when the view may edit the card: task boxes then write their state
  // back into the markdown and pass the new body here.
  onBodyChange?: ((body: string) => void) | undefined;
};

// Renders a card body: GFM, frontmatter hidden, mermaid fences as diagrams,
// task lists as clickable boxes.
export function MarkdownView({ body, onBodyChange }: Props) {
  const setTask = useCallback(
    (offset: number, state: TaskState) => {
      onBodyChange?.(
        `${body.slice(0, offset)}${state}${body.slice(offset + 1)}`,
      );
    },
    [body, onBodyChange],
  );
  return (
    <TaskContext value={onBodyChange === undefined ? undefined : setTask}>
      <div className={markdownClasses.markdown}>
        <Markdown
          remarkPlugins={plugins}
          rehypePlugins={rehypePlugins}
          remarkRehypeOptions={{
            ...remarkHtmlOptions,
            handlers: { yaml: () => undefined },
          }}
          components={components}
        >
          {body}
        </Markdown>
      </div>
    </TaskContext>
  );
}
