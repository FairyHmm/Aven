import { useCallback } from "react";
import Markdown, { type Options } from "react-markdown";
// Only the type: the plugin itself comes with the rich steps.
import type rehypeCallouts from "rehype-callouts";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { remarkHighlight } from "../lib/highlight/remark";
import { remarkHtmlOptions, sanitizeSteps } from "../lib/html/sanitizeStep";
import { remarkInlineMath } from "../lib/math/remarkInline";
import { rehypeTableMerge } from "../lib/table/merge";
import { remarkTasks, type TaskState } from "../lib/tasks";
import { components } from "./markdownComponents";
import { TaskContext } from "./task/TaskItem";

import calloutClasses from "./callouts.module.css";
import markdownClasses from "./markdown.module.css";

const plugins: NonNullable<Options["remarkPlugins"]> = [
  remarkGfm,
  [remarkMath, { singleDollarTextMath: false }],
  remarkInlineMath,
  remarkFrontmatter,
  remarkTasks,
  remarkHighlight,
];

type Rehype = NonNullable<Options["rehypePlugins"]>;

// The extra steps a card with raw HTML or highlighted code needs; they come
// from MarkdownRich, so their dependencies load only when a card needs them.
export type RichSteps = {
  raw: Rehype[number];
  callouts: typeof rehypeCallouts;
  highlight: Rehype[number];
};

// The plugin supplies the markup and the lucide icons; the look is ours, so
// its class names are replaced with the module's.
function calloutsStep(plugin: typeof rehypeCallouts): Rehype[number] {
  return [
    plugin,
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
  ];
}

// Obsidian-style callouts (`> [!note] Title`, `+`/`-` for foldable, GitHub's
// `[!NOTE]` too), drawn by the plugin; folding is a native <details>, no
// script. They, raw HTML and highlighted code need the rich steps.
export function rehypePluginsFor(rich?: RichSteps): Rehype {
  return [
    // HTML first (when the card has any), sanitized; the plugins after it add
    // their own markup.
    ...(rich === undefined ? [] : [rich.raw]),
    ...sanitizeSteps,
    ...(rich === undefined ? [] : [calloutsStep(rich.callouts)]),
    // Table cells: `^` merges into the cell above, `<` into the one to the left.
    rehypeTableMerge,
    // Fenced code in a named language; mermaid and unknown ones are left alone.
    ...(rich === undefined ? [] : [rich.highlight]),
  ];
}

export const liteRehypePlugins = rehypePluginsFor();

export type BodyProps = {
  body: string;
  // Given when the view may edit the card: task boxes then write their state
  // back into the markdown and pass the new body here.
  onBodyChange?: ((body: string) => void) | undefined;
};

type Props = BodyProps & { rehypePlugins: Rehype };

// Renders a card body: GFM, frontmatter hidden, mermaid fences as diagrams,
// task lists as clickable boxes.
export function MarkdownBody({ body, onBodyChange, rehypePlugins }: Props) {
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
