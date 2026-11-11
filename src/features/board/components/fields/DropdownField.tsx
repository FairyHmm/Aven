import { Popover } from "@mantine/core";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { useLinks } from "../../hooks/useFields";
import { attrsOf } from "../../lib/labels/labelColors";
import { colorOf } from "../../lib/labels/tags";
import type { Props } from "../../lib/types";
import { useHoldEscape } from "../../stores/escapeStore";
import { useFieldStore } from "../../stores/fieldStore";
import { OptionPicker } from "./OptionPicker";

import classes from "../cardBack/cardFields.module.css";

export type DropdownPart = {
  // The field, and the list it is on.
  name: string;
  list: string;
  // One option, or several.
  value: string | string[];
  props: Props;
  onProps: (props: Props) => void;
  onValue: (value: string | string[]) => void;
  close: () => void;
};

// Dropdown field: pick one or more options, and manage the shared option list.
export function DropdownField({
  name,
  value,
  props,
  onProps,
  onChange,
}: {
  name: string;
  value: string | string[];
  props: Props;
  onProps: (props: Props) => void;
  onChange: (value: string | string[]) => void;
}) {
  const list = useLinks()[name] ?? name;
  const colors = useFieldStore(state => state.colors[list]);
  const [opened, setOpened] = useState(false);
  const empty = value === "" || (Array.isArray(value) && value.length === 0);
  useHoldEscape(opened);
  const part: DropdownPart = {
    name,
    list,
    value,
    props,
    onProps,
    onValue: onChange,
    close: () => {
      setOpened(false);
    },
  };
  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      width={260}
      trapFocus
    >
      <Popover.Target>
        <button
          type="button"
          className={classes.select}
          aria-label={name}
          data-empty={empty ? "" : undefined}
          {...(typeof value === "string" && !empty
            ? attrsOf(colorOf(value, colors ?? {}))
            : {})}
          onClick={() => {
            setOpened(open => !open);
          }}
        >
          {typeof value === "string" || empty ? (
            <span key="one" className={classes.selectText}>
              {typeof value === "string" && value !== "" ? value : "Select…"}
            </span>
          ) : (
            <span key="several" className={classes.selectPills}>
              {value.map(option => (
                <span
                  key={option}
                  className={classes.pill}
                  {...attrsOf(colorOf(option, colors ?? {}))}
                >
                  {option}
                </span>
              ))}
            </span>
          )}
          <ChevronDown size={14} />
        </button>
      </Popover.Target>
      <Popover.Dropdown>
        <OptionPicker {...part} />
      </Popover.Dropdown>
    </Popover>
  );
}
