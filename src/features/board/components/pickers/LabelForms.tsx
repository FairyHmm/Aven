import { Button, TextInput } from "@mantine/core";
import { useState } from "react";

import { attrsOf, type LabelColor } from "../../lib/labels/labelColors";
import type { PickerKind } from "../../lib/labels/pickerKinds";
import { colorOf, isNamed, type TagColors } from "../../lib/labels/tags";
import { ColorGrid } from "./ColorGrid";
import { PopupHeader } from "./PopupHeader";

import classes from "./pickers.module.css";

type Form = {
  kind: PickerKind;
  heading: string;
  action: string;
  name: string;
  color: LabelColor;
  onBack: () => void;
  onClose: () => void;
  // The label as made: its tag, and its colour.
  onSubmit: (tag: string, color: LabelColor) => void;
  // A way to delete it, where it can be deleted.
  onRemove?: (() => void) | undefined;
};

// Label form: preview, name (optional), and colour.
function LabelForm({ kind, ...props }: Form) {
  const [text, setText] = useState(props.name);
  const [color, setColor] = useState(props.color);
  const typed = kind.normalize(text);
  const tag = typed === "" ? color : typed;
  const blocked = kind.named && typed === "";
  const submit = () => {
    if (!blocked) {
      props.onSubmit(tag, color);
    }
  };

  return (
    <div className={classes.picker}>
      <PopupHeader
        title={props.heading}
        onClose={props.onClose}
        onBack={props.onBack}
      />
      <div className={classes.previewBox}>
        <span className={classes.preview} {...attrsOf(color)}>
          {typed === "" ? "" : kind.show(typed)}
        </span>
      </div>
      <TextInput
        size="sm"
        data-autofocus
        label="Title"
        description={
          kind.named
            ? "Shown in the dropdown."
            : "Optional. Use / for a hierarchy: area/frontend"
        }
        value={text}
        onChange={event => {
          setText(event.currentTarget.value);
        }}
        onKeyDown={event => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
          }
        }}
      />
      <p className={classes.heading2}>Select a color</p>
      <ColorGrid value={color} onChange={setColor} />
      <Button size="xs" disabled={blocked} onClick={submit}>
        {props.action}
      </Button>
      {props.onRemove !== undefined && (
        <Button
          size="xs"
          variant="default"
          color="red"
          onClick={props.onRemove}
        >
          Delete {kind.noun}
        </Button>
      )}
    </div>
  );
}

export function EditLabel(props: {
  kind: PickerKind;
  colors: TagColors;
  tag: string;
  onBack: () => void;
  onClose: () => void;
  // The label with its new tag and colour; the old tag is `tag`.
  onSave: (tag: string, color: LabelColor) => void;
  onRemove?: (() => void) | undefined;
}) {
  return (
    <LabelForm
      kind={props.kind}
      heading={`Edit ${props.kind.noun}`}
      action="Save"
      name={isNamed(props.tag) ? props.tag : ""}
      color={colorOf(props.tag, props.colors)}
      onBack={props.onBack}
      onClose={props.onClose}
      onSubmit={props.onSave}
      onRemove={props.onRemove}
    />
  );
}
