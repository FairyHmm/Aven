import { useLive } from "../../hooks/useLive";
import { datesOf, isField, tagsOf } from "../../lib/props/defaults";
import { isEmptyValue } from "../../lib/props/propView";
import type { Props } from "../../lib/types";
import { DateChip, OtherChip, TagChip } from "./PropChips";

import classes from "./cardProps.module.css";

// The card's properties as small chips under its title: labels (tags, click
// one to see everything under it), dates, and any other property. `inert`
// shows them without the click, for use inside an editor.
export function PropsRow({
  props,
  inert,
  animate,
  scope,
  onDates,
  onProps,
}: {
  props: Props;
  inert?: boolean;
  // What is added while it is shown comes in with a transition.
  animate?: boolean;
  scope?: string;
  // What a click on the dates does (they are not clickable without it).
  onDates?: () => void;
  // Or the calendar opens from the date, and what is picked is passed on.
  onProps?: (props: Props) => void;
}) {
  const live = useLive();
  const tags = tagsOf(props);
  const dates = datesOf(props);
  const others = Object.entries(props).filter(
    ([key, value]) => isField(key, value) && !isEmptyValue(value),
  );
  const hasDates = dates.start !== "" || dates.due !== "";
  if (tags.length === 0 && !hasDates && others.length === 0) {
    return null;
  }
  return (
    <div
      className={classes.props}
      data-live={animate === true && live ? "" : undefined}
      data-leave=""
    >
      {tags.map(tag => (
        <TagChip key={tag} tag={tag} inert={inert === true} scope={scope} />
      ))}
      {hasDates && (
        <DateChip
          props={props}
          scope={scope}
          onChange={onDates}
          onProps={onProps}
        />
      )}
      {others.map(([key, value]) => (
        <OtherChip key={key} name={key} value={value} scope={scope} />
      ))}
    </div>
  );
}
