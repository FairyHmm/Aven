import type { ReactNode } from "react";

import { useSwitchType } from "../../hooks/useFields";
import { useLive } from "../../hooks/useLive";
import {
  datesOf,
  KEYS,
  membersOf,
  tagsOf,
  tracksProgress,
  withProgress,
} from "../../lib/props/defaults";
import {
  customFields,
  type FieldType,
  withField,
} from "../../lib/props/fields";
import type {
  NewFieldKind,
  PopupKind,
  PropertyPopup,
  PropValue,
  Props,
} from "../../lib/types";
import { CardFields } from "../fields/CardFields";
import { MembersSection } from "./MembersSection";
import { PropPopover } from "./PropPopover";
import { DatesSection, LabelsSection, ProgressSection } from "./PropSections";

import classes from "./cardSections.module.css";

type Sections = {
  props: Props;
  body: string;
  onChange: (props: Props) => void;
  open: PopupKind | undefined;
  onOpen: (kind: PopupKind | undefined) => void;
  adding: NewFieldKind | undefined;
  onAdded: () => void;
};

function BuiltInRow({
  props,
  body,
  onChange,
  open,
  onOpen,
}: Pick<Sections, "props" | "body" | "onChange" | "open" | "onOpen">) {
  const tags = tagsOf(props);
  const memberIds = membersOf(props);
  const { start, due } = datesOf(props);
  const switchType = useSwitchType();
  const hasTags = tags.length > 0 || open === "labels";
  const hasMembers = memberIds.length > 0 || open === "members";
  const hasDates = start !== "" || due !== "" || open === "dates";
  const hasProgress = tracksProgress(props);
  if (!hasTags && !hasMembers && !hasDates && !hasProgress) {
    return null;
  }

  const popup = (kind: PropertyPopup, target: ReactNode) => (
    <PropPopover
      kind={kind}
      opened={open === kind}
      onOpened={next => {
        onOpen(next ? kind : undefined);
      }}
      props={props}
      onChange={onChange}
    >
      {target}
    </PropPopover>
  );
  const retype = (key: string, value: PropValue, to: FieldType) => {
    onChange(withField(props, key, switchType(key, value, to)));
  };
  const dateKey = due === "" ? KEYS.start : KEYS.due;
  const dateValue = due === "" ? start : due;
  const sectionOpen =
    open === "labels" || open === "dates" || open === "members"
      ? open
      : undefined;
  const section = { open: sectionOpen, onOpen, popup };

  return (
    <div className={classes.row} data-flip="back:row">
      {hasTags && (
        <LabelsSection
          {...section}
          tags={tags}
          retype={to => {
            retype(KEYS.tags, tags, to);
          }}
        />
      )}
      {hasMembers && (
        <MembersSection
          memberIds={memberIds}
          open={sectionOpen}
          onOpen={onOpen}
          popup={popup}
        />
      )}
      {hasDates && (
        <DatesSection
          {...section}
          start={start}
          due={due}
          retype={to => {
            retype(dateKey, dateValue, to);
          }}
        />
      )}
      {hasProgress && (
        <ProgressSection
          body={body}
          onRemove={() => {
            onChange(withProgress(props, false));
          }}
        />
      )}
    </div>
  );
}

export function CardSections({
  props,
  body,
  onChange,
  open,
  onOpen,
  adding,
  onAdded,
}: Sections) {
  const live = useLive();
  const hasBuiltIn =
    tagsOf(props).length > 0 ||
    membersOf(props).length > 0 ||
    datesOf(props).start !== "" ||
    datesOf(props).due !== "" ||
    tracksProgress(props) ||
    open === "labels" ||
    open === "members" ||
    open === "dates";

  if (!hasBuiltIn && adding === undefined && customFields(props).length === 0) {
    return null;
  }

  return (
    <div className={classes.sections} data-live={live ? "" : undefined}>
      <BuiltInRow
        props={props}
        body={body}
        onChange={onChange}
        open={open}
        onOpen={onOpen}
      />
      <CardFields
        props={props}
        onChange={onChange}
        adding={adding}
        onAdded={onAdded}
      />
    </div>
  );
}
