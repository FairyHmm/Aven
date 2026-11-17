// `==highlight==`, and Obsidian-style personalities: a coloured circle right
// after the opening marks (`==🔴Red highlight==`) picks the colour.

export const HUES = [
  { emoji: "🔴", hue: "red" },
  { emoji: "🟠", hue: "orange" },
  { emoji: "🟡", hue: "yellow" },
  { emoji: "🟢", hue: "green" },
  { emoji: "🔵", hue: "blue" },
  { emoji: "🟣", hue: "purple" },
  { emoji: "🟤", hue: "brown" },
  { emoji: "⚫", hue: "gray" },
  { emoji: "⚪", hue: "white" },
] as const;

// `default` is the plain `==highlight==`, with no circle.
export type Hue = (typeof HUES)[number]["hue"] | "default";

// The circle that writes a colour (none for the default one).
export const emojiOf = (hue: Hue): string =>
  HUES.find(item => item.hue === hue)?.emoji ?? "";

// Not at the start or end: `a == b` is not a highlight; no `==` inside.
export const HIGHLIGHT_PATTERN = /==(?![\s=])((?:(?!==)[^\n])+?)(?<![\s=])==/g;

export type Highlight = {
  // The whole `==...==`.
  from: number;
  to: number;
  hue: Hue;
  // The colour emoji at the start of the content, if any.
  emoji: string | undefined;
};

export function hueOf(content: string): {
  hue: Hue;
  emoji: string | undefined;
} {
  const found = HUES.find(item => content.startsWith(item.emoji));
  return found === undefined
    ? { hue: "default", emoji: undefined }
    : { hue: found.hue, emoji: found.emoji };
}

// Highlights within one line of text (`offset` is where the line starts).
export function findHighlights(text: string, offset = 0): Highlight[] {
  return [...text.matchAll(HIGHLIGHT_PATTERN)].map(match => ({
    from: offset + match.index,
    to: offset + match.index + match[0].length,
    ...hueOf(match[1] ?? ""),
  }));
}
