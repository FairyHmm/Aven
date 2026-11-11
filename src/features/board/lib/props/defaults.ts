import type { PropValue, Props } from "../types";
import { isEmptyValue } from "./propView";

// Built-in properties: labels (tags), dates, and members.
// They live in the card's props under fixed lower-case keys so the YAML reads
// like a note: tags, start, due, repeat, reminder.

export const KEYS = {
  tags: "tags",
  start: "start",
  due: "due",
  repeat: "repeat",
  reminder: "reminder",
  members: "members",
  progress: "progress",
} as const;

const BUILT_IN = new Set<string>(Object.values(KEYS));

export const isBuiltIn = (key: string) => BUILT_IN.has(key);

// A built-in key holding something of another shape (labels turned into
// text, a due date into a number) is no longer that property: it is an
// ordinary field with that name.
export function fitsBuiltIn(key: string, value: PropValue): boolean {
  if (key === KEYS.tags || key === KEYS.members) {
    return Array.isArray(value);
  }
  if (key === KEYS.progress) {
    return typeof value === "boolean";
  }
  return typeof value === "string";
}

export const isField = (key: string, value: PropValue) =>
  !isBuiltIn(key) || !fitsBuiltIn(key, value);

export const REPEATS = ["daily", "weekly", "monthly", "yearly"];

export const REMINDERS = [
  "at time of due date",
  "5 minutes before",
  "10 minutes before",
  "15 minutes before",
  "1 hour before",
  "2 hours before",
  "1 day before",
  "2 days before",
];

function text(props: Props, key: string): string {
  const value = props[key];
  return typeof value === "string" ? value : "";
}

export function tagsOf(props: Props): string[] {
  const value = props[KEYS.tags];
  return Array.isArray(value) ? value : [];
}

function without(props: Props, keys: string[]): Props {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !keys.includes(key)),
  );
}

// An empty list is not stored: no labels is no `tags` key.
export function withTags(props: Props, tags: string[]): Props {
  const rest = without(props, [KEYS.tags]);
  return tags.length === 0 ? rest : { ...rest, [KEYS.tags]: tags };
}

// "" means not set.
export type Dates = {
  start: string;
  due: string;
  repeat: string;
  reminder: string;
};

export function datesOf(props: Props): Dates {
  return {
    start: text(props, KEYS.start),
    due: text(props, KEYS.due),
    repeat: text(props, KEYS.repeat),
    reminder: text(props, KEYS.reminder),
  };
}

// Whether the tile shows how many of the card's task boxes are done. Off by
// default (Aven is info first); an off switch is not stored.
export function tracksProgress(props: Props): boolean {
  return props[KEYS.progress] === true;
}

export function withProgress(props: Props, on: boolean): Props {
  const rest = without(props, [KEYS.progress]);
  return on ? { ...rest, [KEYS.progress]: true } : rest;
}

// Repeating and reminding are about the due date, so they go with it.
export function withDates(props: Props, dates: Dates): Props {
  const next: Props = without(props, [
    KEYS.start,
    KEYS.due,
    KEYS.repeat,
    KEYS.reminder,
  ]);
  const due = dates.due !== "";
  const set = (key: string, value: string, keep: boolean) => {
    if (keep && !isEmptyValue(value)) {
      next[key] = value;
    }
  };
  set(KEYS.start, dates.start, true);
  set(KEYS.due, dates.due, true);
  set(KEYS.repeat, dates.repeat, due);
  set(KEYS.reminder, dates.reminder, due);
  return next;
}

// A date alone counts until the end of that day.
export function isPast(value: string, now = new Date()): boolean {
  const date = new Date(value.includes("T") ? value : `${value}T23:59`);
  return !Number.isNaN(date.getTime()) && date < now;
}
