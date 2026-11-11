import { patchOf } from "../patch";
import type { BoardData, BoardPatch, Props } from "../types";

// A dropdown list is a named list of options of the space. A field is a
// dropdown when it is linked to one; any number of fields can share a list,
// and what happens to an option (renamed, removed) happens on all of them.

export type Lists = Record<string, string[]>;
export type Links = Record<string, string>;

// The fields that use `list`.
export function fieldsOn(links: Links, list: string): string[] {
  return Object.entries(links)
    .filter(([, linked]) => linked === list)
    .map(([field]) => field);
}

// Whether a field's value is `option`, or has it among several.
export function holds(value: Props[string] | undefined, option: string) {
  return Array.isArray(value) ? value.includes(option) : value === option;
}

function renamed(value: Props[string], from: string, to: string) {
  if (!Array.isArray(value)) {
    return value === from ? to : value;
  }
  // Several options: the one renamed keeps its place, "" takes it out, and an
  // option the list already has is not kept twice.
  return [
    ...new Set(
      value.flatMap(item => (item !== from ? [item] : to === "" ? [] : [to])),
    ),
  ];
}

// `props` with `to` wherever one of `fields` holds `from` ("" removes it).
export function rewriteProps(
  props: Props,
  fields: string[],
  from: string,
  to: string,
): Props {
  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      key,
      fields.includes(key) ? renamed(value, from, to) : value,
    ]),
  );
}

// The same on every card of the board that has one of them.
export function rewriteValues(
  data: BoardData,
  fields: string[],
  from: string,
  to: string,
  now = Date.now(),
): BoardPatch {
  if (from === to) {
    return patchOf();
  }
  return patchOf({
    cards: data.cards
      .filter(card => fields.some(field => holds(card.props[field], from)))
      .map(card => ({
        ...card,
        props: rewriteProps(card.props, fields, from, to),
        updatedAt: now,
      })),
  });
}
