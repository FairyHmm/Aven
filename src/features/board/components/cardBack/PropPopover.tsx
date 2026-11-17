import { Popover, type PopoverProps } from "@mantine/core";
import type { ReactNode } from "react";

import {
  membersOf,
  tagsOf,
  withMembers,
  withTags,
} from "../../lib/props/defaults";
import type { PropertyPopup, Props } from "../../lib/types";
import { DatesPicker } from "../pickers/DatesPicker";
import { LabelsPicker } from "../pickers/LabelsPicker";
import { MembersPicker } from "../pickers/MembersPicker";
import { MARK } from "../pickers/popoverFit";

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
          <MembersPicker
            selected={membersOf(props)}
            close={close}
            onChange={members => {
              onChange(withMembers(props, members));
            }}
          />
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
