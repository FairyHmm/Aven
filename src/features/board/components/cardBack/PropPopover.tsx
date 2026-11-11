import { Popover, type PopoverProps } from "@mantine/core";
import type { ReactNode } from "react";

import { tagsOf, withTags } from "../../lib/props/defaults";
import type { PropertyPopup, Props } from "../../lib/types";
import { DatesPicker } from "../pickers/DatesPicker";
import { LabelsPicker } from "../pickers/LabelsPicker";
import { MARK } from "../pickers/popoverFit";
import { PopupHeader } from "../pickers/PopupHeader";

import classes from "../pickers/pickers.module.css";

type Pop = {
  kind: PropertyPopup;
  opened: boolean;
  onOpened: (opened: boolean) => void;
  props: Props;
  onChange: (props: Props) => void;
  position?: PopoverProps["position"];
  // The element the popup opens from.
  children: ReactNode;
};

// One of the property popups (labels, dates, members) opening from
// whatever is passed as its target: a button on the card back, or an item of
// the quick-edit menu. It is rendered in a portal, so it is marked: an editor
// that ends when focus leaves its tile has to know it is still part of it.
export function PropPopover({
  kind,
  opened,
  onOpened,
  props,
  onChange,
  position = "bottom-start",
  children,
}: Pop) {
  const close = () => {
    onOpened(false);
  };
  return (
    <Popover
      opened={opened}
      onChange={onOpened}
      position={position}
      width={304}
      trapFocus
    >
      <Popover.Target>{children}</Popover.Target>
      <Popover.Dropdown {...MARK}>
        {kind === "labels" && (
          <LabelsPicker
            tags={tagsOf(props)}
            close={close}
            onChange={tags => {
              onChange(withTags(props, tags));
            }}
          />
        )}
        {kind === "dates" && (
          <DatesPicker props={props} onChange={onChange} close={close} />
        )}
        {kind === "members" && (
          <div className={classes.picker}>
            <PopupHeader title="Members" onClose={close} />
            <p className={classes.note}>
              Members come with accounts and sharing. Nothing to pick yet.
            </p>
          </div>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
