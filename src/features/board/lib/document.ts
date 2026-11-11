import { parseProps, stringifyProps } from "./props/props";
import type { Card } from "./types";

// A card as one markdown file: the title line, then the properties as YAML
// frontmatter, then the body. YAML is how a card is stored and exchanged
// (export, import, search); people never edit it, they use the property
// controls (see text.ts for what the text editors show).

const FENCE = "---";

export function toDocument({
  title,
  props,
  body,
}: Pick<Card, "title" | "props" | "body">) {
  const yaml = stringifyProps(props).trimEnd();
  const parts = [title];
  if (yaml !== "") {
    parts.push(`${FENCE}\n${yaml}\n${FENCE}`);
  }
  if (body !== "") {
    parts.push(body);
  }
  return parts.join("\n");
}

// Index of the line that closes a frontmatter block opened on line 0 of
// `lines`, if there is one.
function closingFence(lines: string[]): number {
  if (lines[0]?.trimEnd() !== FENCE) {
    return -1;
  }
  return lines.findIndex(
    (line, at) => at > 0 && (line.trimEnd() === FENCE || line === "..."),
  );
}

export function fromDocument(
  text: string,
): Pick<Card, "title" | "props" | "body"> {
  const [first = "", ...rest] = text.split("\n");
  // Blank lines right under the title are spacing, not content.
  const lines = rest
    .join("\n")
    .replace(/^(?:[ \t]*\n)+/, "")
    .split("\n");

  let props: Card["props"] = {};
  let content = lines;
  const end = closingFence(lines);
  if (end > 0) {
    const parsed = parseProps(lines.slice(1, end).join("\n"));
    // An empty block or one we can't represent stays in the body as it is
    // (it may just be two horizontal rules).
    if (parsed !== undefined && Object.keys(parsed).length > 0) {
      props = parsed;
      content = lines.slice(end + 1);
    }
  }

  return {
    title: first.trim(),
    props,
    // The first real line keeps its indentation (it may open a code block).
    body: content
      .join("\n")
      .replace(/^(?:[ \t]*\n)+/, "")
      .trimEnd(),
  };
}
