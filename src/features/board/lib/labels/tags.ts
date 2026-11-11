import {
  HUES,
  isLabelColor,
  type LabelColor,
  STARTER_LABELS,
} from "./labelColors";

// Labels are hashtags: `bug`, `area/frontend`. A slash makes a hierarchy, so
// `area` stands for everything under it, as in Obsidian. A label with no text
// of its own is a tag named after its colour (`green`); naming one gives it
// text. A tag's colour is kept per space (see stores/tagStore.ts); a child
// without its own colour takes its parent's.

export type TagColors = Record<string, LabelColor>;

// Colours as they come back from storage, without trusting them: anything
// that is not a known colour is dropped.
export function parseColors(value: unknown): TagColors {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, LabelColor] =>
        typeof entry[1] === "string" && isLabelColor(entry[1]),
    ),
  );
}

// What the person typed, as a tag: no `#`, lower case, no spaces or odd
// characters, no empty path segments.
export function normalizeTag(input: string): string {
  return input
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}_/-]/gu, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/|\/$/g, "");
}

// A card is under `filter` when it has that tag or one beneath it.
export function underTag(tags: string[], filter: string): boolean {
  return tags.some(tag => tag === filter || tag.startsWith(`${filter}/`));
}

// A label shows text unless it is only a colour.
// How a label is written: `#name`, or nothing for a bare colour.
export function tagText(tag: string): string {
  return isNamed(tag) ? `#${tag}` : "";
}

export function isNamed(tag: string): boolean {
  return !isLabelColor(tag);
}

function spread(tag: string): LabelColor {
  let hash = 0;
  for (const char of tag) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 997;
  }
  return HUES[hash % HUES.length] ?? "gray";
}

// The colour of a name that is new: the first of the palette that no name has
// yet, so new ones differ from each other (and the palette goes round when all
// of it is in use). A name under another one takes its parent's instead (see
// colorOf).
export function freshColor(known: string[], colors: TagColors): LabelColor {
  const used = known.map(tag => colorOf(tag, colors));
  return (
    HUES.find(hue => !used.includes(hue)) ??
    HUES[known.length % HUES.length] ??
    "green"
  );
}

// The tag's own colour, else the nearest parent's, else the colour it is
// named after, else one picked from its name so new labels differ.
export function colorOf(tag: string, colors: TagColors): LabelColor {
  for (let path = tag; ; path = path.slice(0, path.lastIndexOf("/"))) {
    const own = colors[path];
    if (own !== undefined) {
      return own;
    }
    if (!path.includes("/")) {
      break;
    }
  }
  return isLabelColor(tag) ? tag : spread(tag.split("/")[0] ?? tag);
}

// `from` and everything beneath it moved to `to`, without doubles.
export function renamed(tags: string[], from: string, to: string): string[] {
  return [
    ...new Set(
      tags.map(tag =>
        tag === from
          ? to
          : tag.startsWith(`${from}/`)
            ? `${to}${tag.slice(from.length)}`
            : tag,
      ),
    ),
  ];
}

export function knownTags(
  cardTags: string[][],
  colors: TagColors,
  extra: string[] = [],
): string[] {
  return [
    ...new Set([
      ...STARTER_LABELS,
      ...Object.keys(colors),
      ...cardTags.flat(),
      ...extra,
    ]),
  ].sort();
}
