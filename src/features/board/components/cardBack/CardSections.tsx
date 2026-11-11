import type { ReactNode } from "react";

import { useSwitchType } from "../../hooks/useFields";
import { useLive } from "../../hooks/useLive";
import {
  datesOf,
  KEYS,
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
import { PropPopover } from "./PropPopover";
import { DatesSection, LabelsSection, ProgressSection } from "./PropSections";

import classes from "./cardSections.module.css";

type Sections = {
  props: Props;
  // The card's notes, for the progress of their task boxes.
  body: string;
  onChange: (props: Props) => void;
  // The popup opened from here (the label and date sections hold their own
  // anchors; the buttons above hold the ones for what the card doesn't have).
  open: PopupKind | undefined;
  onOpen: (kind: PopupKind | undefined) => void;
  // A new field is being named, and when it is done.
  adding: NewFieldKind | undefined;
  onAdded: () => void;
};

// Renders the card's properties as sections; clicking a section opens its popup.
export function CardSections({
  props,
  body,
  onChange,
  open,
  onOpen,
  adding,
  onAdded,
}: Sections) {
  const tags = tagsOf(props);
  const { start, due } = datesOf(props);
  const switchType = useSwitchType();
  const live = useLive();
  // A section stays while its popup is open, even if it was just emptied.
  const hasTags = tags.length > 0 || open === "labels";
  const hasDates = start !== "" || due !== "" || open === "dates";
  const hasProgress = tracksProgress(props);
  if (
    !hasTags &&
    !hasDates &&
    !hasProgress &&
    adding === undefined &&
    customFields(props).length === 0
  ) {
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
  // Labels and dates are properties like any other: their icon changes their
  // type, and what a type can't hold becomes text.
  const retype = (key: string, value: PropValue, to: FieldType) => {
    onChange(withField(props, key, switchType(key, value, to)));
  };
  const dateKey = due === "" ? KEYS.start : KEYS.due;
  const dateValue = due === "" ? start : due;
  const section = {
    open: open === "labels" || open === "dates" ? open : undefined,
    onOpen,
    popup,
  };
  return (
    <div className={classes.sections} data-live={live ? "" : undefined}>
      {(hasTags || hasDates || hasProgress) && (
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
      )}
      <CardFields
        props={props}
        onChange={onChange}
        adding={adding}
        onAdded={onAdded}
      />
    </div>
  );
}
