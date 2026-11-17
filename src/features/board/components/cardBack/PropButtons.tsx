import {
  CalendarDays,
  CircleChevronDown,
  Paperclip,
  SquareCheck,
  Tag,
  TextCursorInput,
  Users,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { KEYS, tracksProgress, withProgress } from "../../lib/props/defaults";
import type { PopupKind, PropertyPopup, Props } from "../../lib/types";
import { ActionButton } from "../actions/ActionButton";
import { PropPopover } from "./PropPopover";

import classes from "../pickers/pickers.module.css";

type Buttons = {
  props: Props;
  onChange: (props: Props) => void;
  onAttach?: () => void;
  // Which popup is open, when something else (the sections under the buttons)
  // can open them too; otherwise the buttons keep track themselves.
  popup?: {
    open: PopupKind | undefined;
    set: (kind: PopupKind | undefined) => void;
  };
};

const BUTTONS: {
  kind: PropertyPopup;
  label: string;
  icon: ReactNode;
}[] = [
  { kind: "labels", label: "Labels", icon: <Tag size={13} /> },
  { kind: "dates", label: "Dates", icon: <CalendarDays size={13} /> },
  { kind: "members", label: "Members", icon: <Users size={13} /> },
];

// A property already on the card is edited from its section, so don't offer it again.
function filled(kind: PopupKind, props: Props): boolean {
  if (kind === "labels") {
    return KEYS.tags in props;
  }
  if (kind === "members") {
    return KEYS.members in props;
  }
  return kind === "dates" && (KEYS.due in props || KEYS.start in props);
}

// Built-in property buttons plus "Field" and "Dropdown" for adding new fields.
export function PropButtons({ props, onChange, onAttach, popup }: Buttons) {
  const [own, setOwn] = useState<PopupKind>();
  const open = popup ? popup.open : own;
  const setOpen = popup ? popup.set : setOwn;
  return (
    <div className={classes.buttons}>
      {/* A new field is named on the card, in place of a popup. */}
      <ActionButton
        compact
        label="Custom field"
        icon={<TextCursorInput size={13} />}
        onClick={() => {
          setOpen(open === "field" ? undefined : "field");
        }}
      />
      <ActionButton
        compact
        label="Dropdown"
        icon={<CircleChevronDown size={13} />}
        onClick={() => {
          setOpen(open === "dropdown" ? undefined : "dropdown");
        }}
      />
      {BUTTONS.filter(
        // Still there while its popup is open: picking the first label must
        // not take the popup away from under the pointer.
        ({ kind }) => !filled(kind, props) || open === kind,
      ).map(({ kind, label, icon }) => (
        <PropPopover
          key={kind}
          kind={kind}
          opened={open === kind}
          onOpened={next => {
            setOpen(next ? kind : undefined);
          }}
          props={props}
          onChange={onChange}
        >
          <ActionButton
            compact
            label={label}
            icon={icon}
            onClick={() => {
              setOpen(open === kind ? undefined : kind);
            }}
          />
        </PropPopover>
      ))}
      {/* Like the others, it is gone from here once the card has it: its
          section, under the buttons, is where it is switched off. */}
      {!tracksProgress(props) && (
        <ActionButton
          compact
          label="Progress"
          icon={<SquareCheck size={13} />}
          onClick={() => {
            onChange(withProgress(props, true));
          }}
        />
      )}
      {onAttach !== undefined && (
        <ActionButton
          compact
          label="Attach"
          icon={<Paperclip size={13} />}
          onClick={onAttach}
        />
      )}
    </div>
  );
}
