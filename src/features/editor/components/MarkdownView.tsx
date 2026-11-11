import { useCallback } from "react";
import Markdown, {
  type Components,
  type ExtraProps,
  type Options,
} from "react-markdown";
import rehypeCallouts from "rehype-callouts";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";

import { rehypeTableMerge } from "../lib/tableMerge";
import { asTaskState, remarkTasks, type TaskState } from "../lib/tasks";
import { MermaidBlock } from "./MermaidBlock";
import { TaskContext, TaskItem } from "./TaskItem";

import calloutClasses from "./callouts.module.css";
import markdownClasses from "./markdown.module.css";

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

const components: Components = {
  pre: ({ node, children }) => {
    const source = mermaidSource(node);
    return source === undefined ? (
      <pre>{children}</pre>
    ) : (
      <MermaidBlock source={source} />
    );
  },
  li: ({ node, children }) => {
    const state = asTaskState(node?.properties["dataTask"]);
    const offset = node?.properties["dataOffset"];
    return state !== undefined && typeof offset === "number" ? (
      <TaskItem state={state} offset={offset}>
        {children}
      </TaskItem>
    ) : (
      <li>{children}</li>
    );
  },
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

const plugins = [remarkGfm, remarkFrontmatter, remarkTasks];

// Obsidian-style callouts (`> [!note] Title`, `+`/`-` for foldable, GitHub's
// `[!NOTE]` too). The plugin supplies the markup and the lucide icons; the
// look is ours (markdown.module.css), so its class names are replaced with
// the module's. Folding is a native <details>, no script.
const rehypePlugins: NonNullable<Options["rehypePlugins"]> = [
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
];

type Props = {
  body: string;
  // Given when the view may edit the card: task boxes then write their state
  // back into the markdown and pass the new body here.
  onBodyChange?: ((body: string) => void) | undefined;
};

// Renders a card body: GFM, frontmatter hidden, mermaid fences as diagrams,
// task lists as clickable boxes. Properties from the frontmatter get their
// own UI later.
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
          remarkRehypeOptions={{ handlers: { yaml: () => undefined } }}
          components={components}
        >
          {body}
        </Markdown>
      </div>
    </TaskContext>
  );
}
