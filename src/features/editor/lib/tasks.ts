import type { ListItem, Root, RootContent } from "mdast";

// Task list markers, stored as `- [c] text`. `[ ]` and `[x]` are GFM; the
// rest are Aven's (Obsidian-style) extra states.
export const TASK_STATES = [
  { char: " ", label: "Unchecked" },
  { char: "x", label: "Checked" },
  { char: ">", label: "Rescheduled" },
  { char: "<", label: "Scheduled" },
  { char: "!", label: "Important" },
  { char: "-", label: "Cancelled" },
  { char: "/", label: "In progress" },
  { char: "?", label: "Question" },
  { char: "n", label: "Note" },
] as const;

export type TaskState = (typeof TASK_STATES)[number]["char"];

export function asTaskState(value: unknown): TaskState | undefined {
  return TASK_STATES.find(state => state.char === value)?.char;
}

// Only these states are drawn as a circle; every other state is a bare filled
// icon, so it has no border to line up with.
export function isRound(state: TaskState): boolean {
  return state === " " || state === "x" || state === "-" || state === "/";
}

// Where the click on a box leads: checked goes back to unchecked, any other
// state becomes checked.
export function toggled(state: TaskState): TaskState {
  return state === "x" ? " " : "x";
}

const MARKER = /^(?:[-*+]|\d{1,9}[.)])[ \t]+\[(.)\](?=\s|$)/;

// A remark plugin that finds every task item, GFM or custom, and tags the
// list item with `dataTask` (its state) and `dataOffset` (the position of the
// state character in the source) so the renderer can draw its own checkbox
// and write a change back into the markdown. It also strips custom markers
// from the text and clears GFM's `checked`, which would add a native input.
export function remarkTasks() {
  return (tree: Root, file: { value: unknown }) => {
    const source = typeof file.value === "string" ? file.value : "";
    visitItems(tree, item => {
      tag(item, source);
    });
  };
}

function visitItems(
  node: Root | RootContent,
  visit: (item: ListItem) => void,
): void {
  if (node.type === "listItem") {
    visit(node);
  }
  if ("children" in node) {
    for (const child of node.children) {
      visitItems(child, visit);
    }
  }
}

function tag(item: ListItem, source: string): void {
  const start = item.position?.start.offset;
  if (start === undefined) {
    return;
  }
  const match = MARKER.exec(source.slice(start, start + 24));
  const state = asTaskState(match?.[1]?.replace("X", "x"));
  if (match === null || state === undefined) {
    return;
  }
  if (typeof item.checked !== "boolean") {
    stripMarker(item);
  }
  item.checked = null;
  item.data = {
    ...item.data,
    hProperties: {
      ...item.data?.hProperties,
      dataTask: state,
      dataOffset: start + match[0].length - 2,
    },
  };
}

function stripMarker(item: ListItem): void {
  const text =
    item.children[0]?.type === "paragraph"
      ? item.children[0].children[0]
      : undefined;
  if (text?.type === "text") {
    text.value = text.value.replace(/^\[.\]\s?/, "");
  }
}
