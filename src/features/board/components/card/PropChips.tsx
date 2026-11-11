import {
  Bell,
  CalendarDays,
  Clock,
  Repeat,
  Square,
  SquareCheck,
} from "lucide-react";

import { usePressable } from "../../../../shared/hooks/usePressable";
import { useLinks } from "../../hooks/useFields";
import { useTagColors } from "../../hooks/useTags";
import { attrsOf } from "../../lib/labels/labelColors";
import { colorOf, tagText } from "../../lib/labels/tags";
import { datesOf, isPast } from "../../lib/props/defaults";
import { formatDate, kindOf } from "../../lib/props/propView";
import type { Props } from "../../lib/types";
import { useFieldStore } from "../../stores/fieldStore";
import { useLabelView } from "../../stores/labelViewStore";
import { leaves, pressable } from "./chipProps";
import { PickDates } from "./PickDates";

import classes from "./cardProps.module.css";

// What a chip needs to leave with a picture (see glideAround), and, where the
// row is in an editor (`scope` is that editor's), to glide when its neighbours
// come and go.
export function TagChip({
  tag,
  inert,
  scope,
}: {
  tag: string;
  inert: boolean;
  scope: string | undefined;
}) {
  const colors = useTagColors();
  const expanded = useLabelView(state => state.expanded);
  const toggle = useLabelView(state => state.toggle);
  const press = usePressable(toggle);
  const color = attrsOf(colorOf(tag, colors));
  // A label with no text of its own stays a bare strip or bar. The text is
  // always there (collapsed, the strip is too small to show it), so the strip
  // can grow into the named label instead of switching.
  const text = tagText(tag);
  const shown = inert || expanded ? "" : undefined;
  return inert ? (
    <span
      className={classes.tag}
      data-text={shown}
      {...leaves(scope, `tag:${tag}`)}
      {...color}
    >
      {text}
    </span>
  ) : (
    <button
      type="button"
      className={classes.tag}
      data-text={shown}
      title={`#${tag}`}
      aria-label={`#${tag}`}
      {...leaves(scope, `tag:${tag}`)}
      {...color}
      {...press}
    >
      {text}
    </button>
  );
}

export function DateChip({
  props,
  scope,
  onChange,
  onProps,
}: {
  props: Props;
  scope: string | undefined;
  // Clicked to change the dates (and nothing else the card does on a click):
  // whatever the editor does, or, with `onProps`, the calendar opens from the
  // chip itself.
  onChange: (() => void) | undefined;
  onProps: ((props: Props) => void) | undefined;
}) {
  const { start, due, repeat, reminder } = datesOf(props);
  const label =
    start !== "" && due !== ""
      ? `${formatDate(start, undefined, undefined, false)} – ${formatDate(due, undefined, undefined, false)}`
      : due !== ""
        ? formatDate(due, undefined, undefined, false)
        : `From ${formatDate(start, undefined, undefined, false)}`;
  const render = (act: (() => void) | undefined) => (
    <span
      className={classes.chip}
      {...leaves(scope, "dates")}
      {...(act === undefined ? {} : pressable(act))}
      data-overdue={due !== "" && isPast(due) ? "" : undefined}
      title={[
        start !== "" ? `Starts ${start}` : "",
        due !== "" ? `Due ${due}` : "",
        repeat !== "" ? `Repeats ${repeat}` : "",
        reminder !== "" ? `Reminder: ${reminder}` : "",
      ]
        .filter(text => text !== "")
        .join(" · ")}
    >
      <Clock size={12} />
      {label}
      {repeat !== "" && <Repeat size={11} aria-label={`Repeats ${repeat}`} />}
      {reminder !== "" && (
        <Bell size={11} aria-label={`Reminder: ${reminder}`} />
      )}
    </span>
  );
  return onProps === undefined ? (
    render(onChange)
  ) : (
    <PickDates props={props} onProps={onProps} chip={render} />
  );
}

export function OtherChip({
  name,
  value,
  scope,
}: {
  name: string;
  value: Props[string];
  scope: string | undefined;
}) {
  const mark = leaves(scope, `field:${name}`);
  const list = useLinks()[name];
  const colors = useFieldStore(state =>
    list === undefined ? undefined : state.colors[list],
  );
  if (
    list !== undefined &&
    (typeof value === "string" || Array.isArray(value))
  ) {
    // Render dropdown values as coloured badges.
    return (Array.isArray(value) ? value : [value]).map(option => (
      <span
        key={option}
        className={classes.badge}
        title={name}
        {...leaves(scope, `field:${name}:${option}`)}
        {...attrsOf(colorOf(option, colors ?? {}))}
      >
        {option}
      </span>
    ));
  }
  if (Array.isArray(value)) {
    return value.map(item => (
      <span
        key={`${name}:${item}`}
        className={classes.chip}
        title={name}
        {...leaves(scope, `field:${name}:${item}`)}
      >
        {item}
      </span>
    ));
  }
  if (typeof value === "boolean") {
    return (
      <span
        className={classes.chip}
        data-done={value ? "" : undefined}
        {...mark}
      >
        {value ? <SquareCheck size={12} /> : <Square size={12} />}
        {name}
      </span>
    );
  }
  const kind = kindOf(value);
  if (kind === "date" || kind === "datetime") {
    return (
      <span className={classes.chip} title={name} {...mark}>
        <CalendarDays size={12} />
        {formatDate(String(value))}
      </span>
    );
  }
  return (
    <span className={classes.chip} {...mark}>
      <span className={classes.chipKey}>{name}</span>
      {String(value)}
    </span>
  );
}
