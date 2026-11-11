import { X } from "lucide-react";
import { useState } from "react";

import { inferValue } from "../../lib/props/convert";
import { type FieldType, typeOf } from "../../lib/props/fields";
import type { PropValue, Props } from "../../lib/types";
import { FieldControl } from "./FieldControl";
import { RenameInput } from "./RenameInput";
import { TypeMenu } from "./TypeMenu";

import fields from "../cardBack/cardFields.module.css";
import sections from "../cardBack/cardSections.module.css";

type Field = {
  name: string;
  value: PropValue;
  type: FieldType;
  // The card's properties, to tell whether a new name is free.
  props: Props;
  onChange: (value: PropValue) => void;
  // The whole card's properties, when a field changes more than itself.
  onProps: (props: Props) => void;
  onType: (type: FieldType) => void;
  onRename: (name: string) => void;
  onRemove: () => void;
  // Made a moment ago, and typed nothing in yet: its type follows its value.
  auto?: boolean;
};

// A custom field on the card back: an icon that changes its type, its name
// (double-click to rename) over a control for its value, and a small cross
// that takes it off the card. A checkbox is small, so it sits in one line.
export function FieldSection(field: Field) {
  const { name, type, onType, onRemove } = field;
  const [renaming, setRenaming] = useState(false);
  // What an automatic field would be as it is typed, shown by its icon.
  const [typed, setTyped] = useState("");
  const guess = typed.trim() === "" ? "auto" : typeOf(inferValue(typed), false);
  return (
    <section
      className={type === "checkbox" ? sections.toggle : sections.field}
      data-field=""
      data-field-name={name}
      data-leave=""
      data-flip={`back:field:${name}`}
    >
      <h4 className={sections.sectionLabel}>
        <TypeMenu
          name={name}
          type={type}
          value={field.value}
          onType={onType}
          auto={field.auto === true ? guess : undefined}
        />
        {renaming ? (
          <RenameInput
            {...field}
            onDone={() => {
              setRenaming(false);
            }}
          />
        ) : (
          <span
            className={fields.fieldName}
            tabIndex={0}
            title="Double-click to rename"
            onDoubleClick={() => {
              setRenaming(true);
            }}
            onKeyDown={event => {
              if (event.key === "F2") {
                setRenaming(true);
              }
            }}
          >
            {name}
          </span>
        )}
        <button
          type="button"
          className={sections.fieldRemove}
          aria-label={`Remove ${name}`}
          onClick={onRemove}
        >
          <X size={12} />
        </button>
      </h4>
      <div data-control="" className={sections.contents}>
        <FieldControl
          {...field}
          onDraft={field.auto === true ? setTyped : undefined}
        />
      </div>
    </section>
  );
}
