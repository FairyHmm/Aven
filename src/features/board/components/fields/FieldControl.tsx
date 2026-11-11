import { Autocomplete, Checkbox, NumberInput, TagsInput } from "@mantine/core";
import { DateInput, DateTimePicker } from "@mantine/dates";
import { useState } from "react";

import { useKnownValues } from "../../hooks/useFields";
import type { FieldType } from "../../lib/props/fields";
import type { PropValue, Props } from "../../lib/types";
import { STOP } from "../pickers/popoverFit";
import { DropdownField } from "./DropdownField";

type Control = {
  name: string;
  value: PropValue;
  type: FieldType;
  props: Props;
  onChange: (value: PropValue) => void;
  onProps: (props: Props) => void;
  // Text as it is typed, before it is kept.
  onDraft?: ((text: string) => void) | undefined;
};

// The control for a field's value, by its type.
export function FieldControl({
  name,
  value,
  type,
  props,
  onChange,
  onProps,
  onDraft,
}: Control) {
  const known = useKnownValues(name);
  if (
    type === "dropdown" &&
    (typeof value === "string" || Array.isArray(value))
  ) {
    return (
      <DropdownField
        name={name}
        value={value}
        props={props}
        onProps={onProps}
        onChange={onChange}
      />
    );
  }
  if (typeof value === "boolean") {
    return (
      <Checkbox
        size="sm"
        aria-label={name}
        checked={value}
        onChange={event => {
          onChange(event.currentTarget.checked);
        }}
      />
    );
  }
  if (typeof value === "number") {
    return (
      <NumberInput
        size="xs"
        aria-label={name}
        value={value}
        onChange={next => {
          if (typeof next === "number") {
            onChange(next);
          }
        }}
      />
    );
  }
  if (Array.isArray(value)) {
    return (
      <TagsInput
        size="xs"
        aria-label={name}
        placeholder="Add…"
        data={known}
        {...STOP}
        value={value}
        onChange={onChange}
      />
    );
  }
  if (type === "date") {
    return (
      <DateInput
        size="xs"
        aria-label={name}
        {...STOP}
        valueFormat="D MMM YYYY"
        value={value.slice(0, 10)}
        onChange={next => {
          // Clearing it would turn it back into text.
          if (next !== null) {
            onChange(next.slice(0, 10));
          }
        }}
      />
    );
  }
  if (type === "datetime") {
    return (
      <DateTimePicker
        size="xs"
        aria-label={name}
        {...STOP}
        valueFormat="D MMM YYYY, HH:mm"
        value={value.slice(0, 16).replace("T", " ")}
        onChange={next => {
          if (next !== null) {
            onChange(next.slice(0, 16).replace(" ", "T"));
          }
        }}
      />
    );
  }
  return (
    <TextControl
      name={name}
      value={value}
      known={known}
      onChange={onChange}
      onDraft={onDraft}
    />
  );
}

// Text is saved when it is left (or a suggestion is taken), so a value that
// happens to look like a date doesn't turn into a date picker while it is
// being typed.
function TextControl({
  name,
  value,
  known,
  onChange,
  onDraft,
}: {
  name: string;
  value: string;
  known: string[];
  onChange: (value: string) => void;
  onDraft?: ((text: string) => void) | undefined;
}) {
  const [draft, setDraft] = useState(value);
  const commit = (next: string) => {
    if (next !== value) {
      onChange(next);
    }
  };
  return (
    <Autocomplete
      size="xs"
      aria-label={name}
      {...STOP}
      data={known}
      value={draft}
      onChange={next => {
        setDraft(next);
        onDraft?.(next);
      }}
      onOptionSubmit={next => {
        setDraft(next);
        commit(next);
      }}
      onBlur={() => {
        commit(draft);
      }}
      onKeyDown={event => {
        if (event.key === "Enter") {
          commit(draft);
        }
      }}
    />
  );
}
