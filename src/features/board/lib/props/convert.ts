import type { PropValue } from "../types";
import { FIELD_TYPE_LABELS, type FieldType, isoDay, isoMinute } from "./fields";

const DAY = /^\d{4}-\d{2}-\d{2}/;
const MINUTE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;
const YES = /^(true|yes|y|1|x)$/i;
const NO = /^(false|no|n|0)$/i;
const WHOLE_DAY = /^\d{4}-\d{2}-\d{2}$/;
const WHOLE_MINUTE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}$/;

function asText(value: PropValue): string {
  return Array.isArray(value) ? value.join(", ") : String(value);
}

function toNumber(value: PropValue): number {
  const first = Array.isArray(value) ? (value[0] ?? "") : value;
  const number =
    typeof first === "boolean"
      ? Number(first)
      : Number.parseFloat(String(first));
  return Number.isFinite(number) ? number : 0;
}

function toChecked(value: PropValue): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  return Array.isArray(value) ? value.length > 0 : YES.test(value.trim());
}

function toDateTime(text: string, now: Date): string {
  const minute = MINUTE.exec(text)?.[0];
  if (minute !== undefined) {
    return minute.replace(" ", "T");
  }
  const day = DAY.exec(text)?.[0];
  return day === undefined ? isoMinute(now) : `${day}T09:00`;
}

function toList(value: PropValue, text: string): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return text
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "");
}

// The same value as another type, as far as it can be carried over: a number
// to text is its digits, a list to text is its items with commas, a date to
// date & time is that day at 09:00. What can't be carried over becomes the
// type's starting value.
export function convertValue(
  value: PropValue,
  to: FieldType,
  now = new Date(),
): PropValue {
  const text = asText(value);
  switch (to) {
    case "number":
      return toNumber(value);
    case "checkbox":
      return toChecked(value);
    case "date":
      return DAY.exec(text)?.[0] ?? isoDay(now);
    case "datetime":
      return toDateTime(text, now);
    case "list":
      return toList(value, text);
    case "dropdown":
      // One option as text, or several as the list they are.
      return Array.isArray(value) ? value : text;
    default:
      return text;
  }
}

// Whether `value` as another type is still the same information: "3" is 3,
// "2026-11-08" is that date, "yes" is checked, but "soon" is not a date, and a
// date & time as a date loses the time.
function keepsEverything(value: PropValue, to: FieldType): boolean {
  const text = asText(value).trim();
  if (text === "") {
    return true;
  }
  switch (to) {
    case "number":
      return (
        typeof value === "number" ||
        typeof value === "boolean" ||
        Number.isFinite(Number(text))
      );
    case "checkbox":
      if (typeof value === "number") {
        return value === 0 || value === 1;
      }
      return (
        typeof value === "boolean" ||
        (typeof value === "string" && (YES.test(text) || NO.test(text)))
      );
    case "date":
      return WHOLE_DAY.test(text);
    case "datetime":
      return WHOLE_DAY.test(text) || WHOLE_MINUTE.test(text);
    default:
      return true;
  }
}

function show(value: PropValue): string {
  if (typeof value === "boolean") {
    return value ? "checked" : "unchecked";
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? "an empty list" : `“${value.join(", ")}”`;
  }
  return typeof value === "string" ? `“${value}”` : String(value);
}

// What would be lost turning `value` into `to`, in words, or undefined when
// nothing would: the card back asks before it does that.
export function lossNote(
  value: PropValue,
  to: FieldType,
  now = new Date(),
): string | undefined {
  if (keepsEverything(value, to)) {
    return undefined;
  }
  const next = convertValue(value, to, now);
  return `${show(value)} can't be kept as ${FIELD_TYPE_LABELS[to].toLowerCase()}. It would become ${show(next)}.`;
}

// What a new field's first value is, going by how it is written: 12 is a
// number, true a checked box. A date written as one stays text that reads as
// a date, and 007 stays text, as it is not a number but a code.
export function inferValue(text: string): PropValue {
  const written = text.trim();
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(written)) {
    return Number(written);
  }
  if (/^(true|false)$/i.test(written)) {
    return written.toLowerCase() === "true";
  }
  return text;
}
