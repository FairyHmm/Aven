import { CircleChevronDown, Sparkles } from "lucide-react";

import type { NewFieldKind, Props } from "../../lib/types";
import { RenameInput } from "./RenameInput";

import fields from "../cardBack/cardFields.module.css";
import sections from "../cardBack/cardSections.module.css";

// The place where a new field is named. A custom field is not a type yet: it
// starts as text and takes the type of its first value, so its icon is a spark
// that does nothing, not a button to click first. A dropdown is one already.
export function NewField({
  kind,
  props,
  onNamed,
  onDone,
}: {
  kind: NewFieldKind;
  props: Props;
  onNamed: (name: string) => void;
  onDone: () => void;
}) {
  return (
    <section className={sections.field}>
      <h4 className={sections.sectionLabel}>
        <span
          className={fields.typeAuto}
          title={
            kind === "dropdown"
              ? "Dropdown"
              : "Automatic: the type follows the value you enter"
          }
          aria-hidden
        >
          {kind === "dropdown" ? (
            <CircleChevronDown size={13} />
          ) : (
            <Sparkles size={13} />
          )}
        </span>
        <RenameInput
          name=""
          placeholder={kind === "dropdown" ? "Dropdown name" : "Field name"}
          props={props}
          onRename={onNamed}
          onDone={onDone}
        />
      </h4>
    </section>
  );
}
