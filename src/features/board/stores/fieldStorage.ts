import { parseColors, type TagColors } from "../lib/labels/tags";
import type { Links, Lists } from "../lib/props/dropdowns";

export type OptionColors = Record<string, TagColors>;

export type Saved = { lists: Lists; links: Links; colors: OptionColors };

export const keyOf = (spaceId: string) => `aven:v1:space:${spaceId}:dropdowns`;

const NONE: Saved = { lists: {}, links: {}, colors: {} };

function recordOf(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? Object.fromEntries(Object.entries(value))
    : {};
}

function isStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

export function parseSaved(raw: unknown): Saved {
  if (raw === undefined || raw === null) {
    return NONE;
  }
  const saved = recordOf(raw);
  return {
    lists: Object.fromEntries(
      Object.entries(recordOf(saved["lists"])).filter(
        (entry): entry is [string, string[]] => isStrings(entry[1]),
      ),
    ),
    links: Object.fromEntries(
      Object.entries(recordOf(saved["links"])).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
    colors: Object.fromEntries(
      Object.entries(recordOf(saved["colors"])).map(([list, own]) => [
        list,
        parseColors(own),
      ]),
    ),
  };
}

export function read(spaceId: string): Saved {
  try {
    const raw = localStorage.getItem(keyOf(spaceId));
    return raw === null ? NONE : parseSaved(JSON.parse(raw));
  } catch {
    return NONE;
  }
}
