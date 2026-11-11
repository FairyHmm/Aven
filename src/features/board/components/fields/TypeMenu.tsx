import { Button, Menu, Popover } from "@mantine/core";
import {
  CalendarClock,
  CalendarDays,
  Check,
  CircleChevronDown,
  Hash,
  List,
  type LucideIcon,
  Sparkles,
  SquareCheck,
  Text,
} from "lucide-react";
import { useState } from "react";

import { lossNote } from "../../lib/props/convert";
import {
  FIELD_TYPE_LABELS,
  FIELD_TYPES,
  type FieldType,
} from "../../lib/props/fields";
import type { PropValue } from "../../lib/types";
import { useHoldEscape } from "../../stores/escapeStore";
import { MARK } from "../pickers/popoverFit";

import classes from "../cardBack/cardFields.module.css";

export const FIELD_ICONS: Record<FieldType, LucideIcon> = {
  text: Text,
  number: Hash,
  checkbox: SquareCheck,
  date: CalendarDays,
  datetime: CalendarClock,
  list: List,
  dropdown: CircleChevronDown,
};

export const AUTO_ICONS: Record<FieldType | "auto", LucideIcon> = {
  ...FIELD_ICONS,
  auto: Sparkles,
};

// The icon in front of a property's name is its type; clicking it lists the
// types to change it to, as in Obsidian.
export function TypeMenu({
  name,
  type,
  value,
  onType,
  auto,
}: {
  name: string;
  type: FieldType;
  value: PropValue;
  onType: (type: FieldType) => void;
  // A new field whose type follows what is typed: the icon shows the type it
  // would be (or a spark, while nothing is typed), not the type it has.
  auto?: FieldType | "auto" | undefined;
}) {
  const Icon = auto === undefined ? FIELD_ICONS[type] : AUTO_ICONS[auto];
  const label = auto === undefined ? FIELD_TYPE_LABELS[type] : "Automatic";
  const [opened, setOpened] = useState(false);
  // A change that would lose part of the value waits for an answer.
  const [pending, setPending] = useState<{ to: FieldType; note: string }>();
  useHoldEscape(opened || pending !== undefined);
  const menu = (
    <Menu
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      withinPortal
    >
      <Menu.Target>
        <button
          type="button"
          className={classes.typeButton}
          aria-label={`${name}: ${label}. Change type`}
          title={label}
        >
          <Icon size={13} />
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        {FIELD_TYPES.map(option => {
          const OptionIcon = FIELD_ICONS[option];
          return (
            <Menu.Item
              key={option}
              leftSection={<OptionIcon size={14} />}
              rightSection={option === type ? <Check size={14} /> : null}
              onClick={() => {
                const note = lossNote(value, option);
                if (option === type) {
                  return;
                }
                if (note === undefined) {
                  onType(option);
                } else {
                  setPending({ to: option, note });
                }
              }}
            >
              {FIELD_TYPE_LABELS[option]}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
  return (
    <Popover
      opened={pending !== undefined}
      onChange={next => {
        if (!next) {
          setPending(undefined);
        }
      }}
      position="bottom-start"
      width={260}
      trapFocus
    >
      <Popover.Target>
        <span className={classes.typeAnchor}>{menu}</span>
      </Popover.Target>
      <Popover.Dropdown {...MARK}>
        <div className={classes.confirm}>
          <p className={classes.confirmNote}>{pending?.note}</p>
          <div className={classes.confirmButtons}>
            <Button
              size="xs"
              variant="default"
              data-autofocus
              onClick={() => {
                setPending(undefined);
              }}
            >
              Keep {FIELD_TYPE_LABELS[type].toLowerCase()}
            </Button>
            <Button
              size="xs"
              color="red"
              onClick={() => {
                if (pending !== undefined) {
                  onType(pending.to);
                }
                setPending(undefined);
              }}
            >
              Convert
            </Button>
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
