import dayjs from "dayjs";

import type { PropValue, Props } from "../types";
import { isBuiltIn, isField } from "./defaults";
import { kindOf } from "./propView";

// Custom fields are the card's other YAML keys: any key that is not one of
// the built-in properties. A field's type is the type of its value (see
// propView.ts), except a dropdown, which a string value only is when the
// space has given its name a list of options (see stores/fieldStore.ts).

export const FIELD_TYPES = [
  "text",
  "number",
  "checkbox",
  "date",
  "datetime",
  "list",
  "dropdown",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  number: "Number",
  checkbox: "Checkbox",
  date: "Date",
  datetime: "Date & time",
  list: "List",
  dropdown: "Dropdown",
};

// The type a value has on the card back. A dropdown holds one option (a text)
// or, when several can be chosen, a list of them.
export function typeOf(value: PropValue, isDropdown: boolean): FieldType {
  const kind = kindOf(value);
  return isDropdown && (kind === "text" || kind === "list") ? "dropdown" : kind;
}

export function isoDay(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

export function isoMinute(date: Date): string {
  return dayjs(date).format("YYYY-MM-DDTHH:mm");
}

// What a new field holds. An empty date would read as text, so a date starts
// as today.
export function initialValue(type: FieldType, now = new Date()): PropValue {
  if (type === "number") {
    return 0;
  }
  if (type === "checkbox") {
    return false;
  }
  if (type === "date") {
    return isoDay(now);
  }
  if (type === "datetime") {
    return isoMinute(now);
  }
  return type === "list" ? [] : "";
}

export function customFields(props: Props): [string, PropValue][] {
  return Object.entries(props).filter(([key, value]) => isField(key, value));
}

// Why a name can't be used, or undefined when it can. `current` is the field
// being renamed, whose own name is fine.
export function fieldError(
  name: string,
  props: Props,
  current?: string,
): string | undefined {
  const wanted = name.trim();
  if (wanted === "") {
    return "Give the field a name.";
  }
  if (wanted === current) {
    return undefined;
  }
  if (isBuiltIn(wanted.toLowerCase())) {
    return `“${wanted}” is already a built-in property.`;
  }
  if (wanted in props) {
    return `This card already has “${wanted}”.`;
  }
  return undefined;
}

export function withField(props: Props, name: string, value: PropValue): Props {
  return { ...props, [name]: value };
}

export function withoutField(props: Props, name: string): Props {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => key !== name),
  );
}

// The field under a new name, still where it was in the YAML.
export function renameField(props: Props, from: string, to: string): Props {
  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      key === from ? to : key,
      value,
    ]),
  );
}

// What the field `name` holds on the given cards: its text, or the items of
// its list, once each, in order of first use. These are what text, list and
// dropdown fields suggest.
export function knownValues(cards: Props[], name: string): string[] {
  const seen = new Set<string>();
  for (const props of cards) {
    const value = props[name];
    for (const item of Array.isArray(value) ? value : [value]) {
      if (typeof item === "string" && item !== "") {
        seen.add(item);
      }
    }
  }
  return [...seen];
}
