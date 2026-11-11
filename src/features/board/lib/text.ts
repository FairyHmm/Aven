import type { Card } from "./types";

// What the text editors show of a card: the first line is its title, whatever
// follows it the body. Properties are not text here; they have their own
// controls (see document.ts for the whole card as one markdown file).

export function joinCard({ title, body }: Pick<Card, "title" | "body">) {
  return body === "" ? title : `${title}\n${body}`;
}

export function splitCard(text: string): Pick<Card, "title" | "body"> {
  const [first = "", ...rest] = text.split("\n");
  return {
    title: first.trim(),
    // Blank lines right under the title are spacing, not content; the first
    // real line keeps its indentation (it may open a code block).
    body: rest
      .join("\n")
      .replace(/^(?:[ \t]*\n)+/, "")
      .trimEnd(),
  };
}
