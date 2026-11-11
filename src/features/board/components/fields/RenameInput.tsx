import { useState } from "react";

import { fieldError } from "../../lib/props/fields";
import type { Props } from "../../lib/types";

import classes from "../cardBack/cardFields.module.css";

// Enter or leaving it keeps a name that is free; Esc keeps the old one. (An
// empty `name` is a new field being named: nothing to keep.)
export function RenameInput({
  name,
  props,
  onRename,
  onDone,
  placeholder,
}: {
  name: string;
  props: Props;
  onRename: (name: string) => void;
  onDone: () => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(name);
  const [invalid, setInvalid] = useState(false);
  const error = fieldError(draft, props, name);
  const commit = (leaving: boolean) => {
    if (error !== undefined) {
      if (leaving) {
        onDone();
      }
      setInvalid(true);
      return;
    }
    if (draft.trim() !== name) {
      onRename(draft.trim());
    }
    onDone();
  };
  return (
    <span className={classes.renameWrap}>
      <input
        className={classes.renameInput}
        aria-label="Field name"
        placeholder={placeholder}
        aria-invalid={invalid}
        title={invalid ? error : undefined}
        // Esc here must not close the card.
        data-mantine-stop-propagation="true"
        // oxlint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        onFocus={event => {
          event.currentTarget.select();
        }}
        value={draft}
        onChange={event => {
          setDraft(event.currentTarget.value);
          setInvalid(false);
        }}
        onBlur={() => {
          commit(true);
        }}
        onKeyDown={event => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit(false);
          } else if (event.key === "Escape") {
            event.preventDefault();
            onDone();
          }
        }}
      />
      {invalid && error !== undefined && (
        <span role="alert" className={classes.fieldError}>
          {error}
        </span>
      )}
    </span>
  );
}
