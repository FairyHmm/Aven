import { useLive } from "../../hooks/useLive";
import { datesOf, isField, membersOf, tagsOf } from "../../lib/props/defaults";
import { isEmptyValue } from "../../lib/props/propView";
import type { Props } from "../../lib/types";
import { MemberChips } from "./MemberChips";
import { DateChip, OtherChip, TagChip } from "./PropChips";

import classes from "./cardProps.module.css";

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
  animate?: boolean;
  scope?: string;
  onDates?: () => void;
  onProps?: (props: Props) => void;
}) {
  const live = useLive();
  const tags = tagsOf(props);
  const members = membersOf(props);
  const dates = datesOf(props);
  const others = Object.entries(props).filter(
    ([key, value]) => isField(key, value) && !isEmptyValue(value),
  );
  const hasDates = dates.start !== "" || dates.due !== "";
  if (
    tags.length === 0 &&
    members.length === 0 &&
    !hasDates &&
    others.length === 0
  ) {
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
      {members.length > 0 && <MemberChips memberIds={members} />}
      {others.map(([key, value]) => (
        <OtherChip key={key} name={key} value={value} scope={scope} />
      ))}
    </div>
  );
}
