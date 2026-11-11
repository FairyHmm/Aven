import type { PropValue } from "../types";

// How a property value is shown. Until a space defines a property (type,
// options), the kind is guessed from the value itself, the way Obsidian does.

export type PropKind =
  | "checkbox"
  | "date"
  | "datetime"
  | "number"
  | "list"
  | "text";

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATETIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/;

export function kindOf(value: PropValue): PropKind {
  if (typeof value === "boolean") {
    return "checkbox";
  }
  if (typeof value === "number") {
    return "number";
  }
  if (Array.isArray(value)) {
    return "list";
  }
  if (DATETIME.test(value)) {
    return "datetime";
  }
  return DATE.test(value) ? "date" : "text";
}

// "Nov 14", "Nov 14, 2027" outside the current year, and ", 09:30" for date
// & time (left off with `withTime` false: a card tile shows only the day, the
// time is for the card back). Built from the parts, so the day never shifts
// with the time zone.
export function formatDate(
  value: string,
  now = new Date(),
  locale?: string,
  withTime = true,
): string {
  const match = DATETIME.exec(value) ?? DATE.exec(value);
  if (match === null) {
    return value;
  }
  const [, year = "", month = "", day = "", hour, minute] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour ?? 0),
    Number(minute ?? 0),
  );
  const parts = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
    ...(hour === undefined || !withTime
      ? {}
      : { hour: "2-digit", minute: "2-digit" }),
  });
  return parts.format(date);
}

// A property with nothing to show (empty text, empty list) has no chip.
export function isEmptyValue(value: PropValue): boolean {
  return Array.isArray(value) ? value.length === 0 : value === "";
}
