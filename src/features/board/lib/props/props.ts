import { parse, stringify } from "yaml";

import type { PropValue, Props } from "../types";

// A card's properties are the YAML frontmatter that sits right under its
// title. They are stored as a plain map (Firestore-friendly) and written back
// as readable YAML, since raw editing is supported. Dates stay strings
// ("2026-11-07", "2026-11-07T14:30"); which input they get is the property
// definition's business, not the value's.

function isScalar(value: unknown): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

export function isPropValue(value: unknown): value is PropValue {
  return (
    isScalar(value) ||
    (Array.isArray(value) && value.every(item => typeof item === "string"))
  );
}

// Leniently reads a stored map: anything that isn't a valid value is dropped.
export function toProps(value: unknown): Props {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  const props: Props = {};
  for (const [key, item] of Object.entries(value)) {
    if (isPropValue(item)) {
      props[key] = item;
    }
  }
  return props;
}

// The text between the two `---` lines, or undefined when it isn't a flat map
// of supported values. Such a block is left in the body untouched instead of
// being half understood and rewritten.
export function parseProps(yaml: string): Props | undefined {
  let value: unknown;
  try {
    value = parse(yaml);
  } catch {
    return undefined;
  }
  if (value === null) {
    return {};
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const props: Props = {};
  for (const [key, item] of Object.entries(value)) {
    // `key:` with nothing after it is an empty text property.
    const next: unknown = item === null ? "" : item;
    if (!isPropValue(next)) {
      return undefined;
    }
    props[key] = next;
  }
  return props;
}

export function stringifyProps(props: Props): string {
  return Object.keys(props).length === 0
    ? ""
    : stringify(props, { lineWidth: 0 });
}
