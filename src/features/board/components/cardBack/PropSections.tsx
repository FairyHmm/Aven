import { ChevronDown, Plus, SquareCheck, X } from "lucide-react";
import type { ReactNode } from "react";

import { useTagColors } from "../../hooks/useTags";
import { attrsOf } from "../../lib/labels/labelColors";
import { colorOf, tagText } from "../../lib/labels/tags";
import { isPast } from "../../lib/props/defaults";
import type { FieldType } from "../../lib/props/fields";
import { typeOf } from "../../lib/props/fields";
import { progressOf } from "../../lib/props/progress";
import { formatDate } from "../../lib/props/propView";
import type { PropertyPopup } from "../../lib/types";
import { TypeMenu } from "../fields/TypeMenu";

import fields from "./cardFields.module.css";
import sections from "./cardSections.module.css";
import widgets from "./cardWidgets.module.css";

// What a section needs from the card back around it: the popup of its kind
// (opened from the element passed in), whether that popup is open, and a
// change of the type of what it shows.
type Section = {
  open: PropertyPopup | undefined;
  onOpen: (kind: PropertyPopup | undefined) => void;
  popup: (kind: PropertyPopup, target: ReactNode) => ReactNode;
  retype: (to: FieldType) => void;
};

export function LabelsSection({
  tags,
  open,
  onOpen,
  popup,
  retype,
}: Section & { tags: string[] }) {
  const colors = useTagColors();
  // The popup opens under the whole section, not under the plus: that moves
  // right with every label that is added, and would take the popup with it.
  return popup(
    "labels",
    <section
      className={sections.section}
      data-leave=""
      data-flip="back:section:labels"
    >
      <h4 className={sections.sectionLabel}>
        <TypeMenu name="Labels" type="list" value={tags} onType={retype} />
        Labels
      </h4>
      <div className={sections.sectionValue}>
        {tags.map(tag => (
          <button
            key={tag}
            type="button"
            className={widgets.label}
            data-leave=""
            data-flip={`back:tag:${tag}`}
            {...attrsOf(colorOf(tag, colors))}
            onClick={() => {
              onOpen("labels");
            }}
          >
            {tagText(tag)}
          </button>
        ))}
        <button
          type="button"
          className={widgets.add}
          aria-label="Edit labels"
          onClick={() => {
            onOpen(open === "labels" ? undefined : "labels");
          }}
        >
          <Plus size={16} />
        </button>
      </div>
    </section>,
  );
}

// The due date, or the start date when there is no due date.
export function DatesSection({
  start,
  due,
  open,
  onOpen,
  popup,
  retype,
}: Section & { start: string; due: string }) {
  const title = due === "" ? "Start date" : "Due date";
  const shown = due === "" ? start : due;
  return (
    <section
      className={sections.section}
      data-leave=""
      data-flip="back:section:dates"
    >
      <h4 className={sections.sectionLabel}>
        <TypeMenu
          name={title}
          type={typeOf(shown, false)}
          value={shown}
          onType={retype}
        />
        {title}
      </h4>
      {popup(
        "dates",
        <button
          type="button"
          className={widgets.date}
          onClick={() => {
            onOpen(open === "dates" ? undefined : "dates");
          }}
        >
          {start !== "" && due !== ""
            ? `${formatDate(start)} – ${formatDate(due)}`
            : formatDate(shown)}
          {due !== "" && isPast(due) && (
            <span className={widgets.overdue}>Overdue</span>
          )}
          <ChevronDown size={14} />
        </button>,
      )}
    </section>
  );
}

// How far the card's task boxes are, switched on from the buttons above: the
// count and a bar that follow the notes as they are typed, and an X to stop
// counting (which puts the button back).
export function ProgressSection({
  body,
  onRemove,
}: {
  body: string;
  onRemove: () => void;
}) {
  const { done, total } = progressOf(body);
  // In progress boxes make halves: 2.5, not 2.5000000001.
  const shown = String(Math.round(done * 10) / 10);
  return (
    <section
      className={sections.section}
      data-leave=""
      data-flip="back:section:progress"
    >
      <h4 className={sections.sectionLabel}>
        <span className={fields.typeAuto}>
          <SquareCheck size={13} aria-hidden />
        </span>
        Progress
        <button
          type="button"
          className={sections.fieldRemove}
          aria-label="Stop counting progress"
          onClick={onRemove}
        >
          <X size={12} />
        </button>
      </h4>
      {total === 0 ? (
        <span className={widgets.progressNote}>No task boxes in the notes</span>
      ) : (
        <div
          className={widgets.progress}
          data-complete={done === total ? "" : undefined}
        >
          {shown}/{total}
          <span className={widgets.progressTrack} aria-hidden>
            <span
              className={widgets.progressFill}
              style={{ width: `${(done / total) * 100}%` }}
            />
          </span>
        </div>
      )}
    </section>
  );
}
