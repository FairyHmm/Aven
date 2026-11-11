import { Button, Checkbox, NativeSelect, TextInput } from "@mantine/core";
import { Calendar, TimeInput } from "@mantine/dates";
import { useState } from "react";

import {
  type Dates,
  datesOf,
  REMINDERS,
  REPEATS,
  withDates,
} from "../../lib/props/defaults";
import { isoDay } from "../../lib/props/fields";
import type { Props } from "../../lib/types";
import { PopupHeader } from "./PopupHeader";

import classes from "./pickers.module.css";

type Picker = {
  props: Props;
  onChange: (props: Props) => void;
  close: () => void;
};

const NEVER = [{ value: "", label: "Never" }];
const NONE = [{ value: "", label: "None" }];
const options = (list: string[]) =>
  list.map(value => ({ value, label: value }));

const DEFAULT_TIME = "17:00";
const NOTHING: Dates = { start: "", due: "", repeat: "", reminder: "" };

// Date picker: start/due, repeat, and reminder. Changes apply on Save; Remove clears.
export function DatesPicker({ props, onChange, close }: Picker) {
  const [draft, setDraft] = useState<Dates>(() => datesOf(props));
  const [startOn, setStartOn] = useState(draft.start !== "");
  const [dueOn, setDueOn] = useState(true);
  // The field a click on the calendar fills in.
  const [active, setActive] = useState<"start" | "due">("due");

  const dueDate = draft.due.slice(0, 10);
  const dueTime = draft.due.slice(11, 16);
  const set = (change: Partial<Dates>) => {
    setDraft(current => ({ ...current, ...change }));
  };
  const setDue = (date: string, time: string) => {
    set({
      due: date === "" ? "" : `${date}T${time === "" ? DEFAULT_TIME : time}`,
    });
  };

  const pick = (date: string) => {
    if (active === "start" && startOn) {
      set({ start: date });
    } else if (dueOn) {
      setDue(date, dueTime);
    } else if (startOn) {
      set({ start: date });
    }
  };

  return (
    <div className={classes.picker}>
      <PopupHeader title="Dates" onClose={close} />
      <Calendar
        size="sm"
        highlightToday
        defaultDate={dueDate || draft.start || isoDay(new Date())}
        getDayProps={date => ({
          selected: date === draft.start || date === dueDate,
          onClick: () => {
            pick(date);
          },
        })}
      />
      <div className={classes.field}>
        <Checkbox
          size="xs"
          label="Start date"
          checked={startOn}
          onChange={event => {
            setStartOn(event.currentTarget.checked);
            setActive("start");
            if (!event.currentTarget.checked) {
              set({ start: "" });
            }
          }}
        />
        <TextInput
          size="sm"
          type="date"
          aria-label="Start date"
          disabled={!startOn}
          value={draft.start}
          onFocus={() => {
            setActive("start");
          }}
          onChange={event => {
            set({ start: event.currentTarget.value });
          }}
        />
      </div>
      <div className={classes.field}>
        <Checkbox
          size="xs"
          label="Due date"
          checked={dueOn}
          onChange={event => {
            setDueOn(event.currentTarget.checked);
            setActive("due");
            if (!event.currentTarget.checked) {
              set({ due: "" });
            }
          }}
        />
        <div className={classes.dueRow}>
          <TextInput
            size="sm"
            type="date"
            aria-label="Due date"
            disabled={!dueOn}
            value={dueDate}
            onFocus={() => {
              setActive("due");
            }}
            onChange={event => {
              setDue(event.currentTarget.value, dueTime);
            }}
          />
          <TimeInput
            size="sm"
            aria-label="Due time"
            disabled={!dueOn || dueDate === ""}
            value={dueTime}
            onChange={event => {
              setDue(
                dueDate === "" ? isoDay(new Date()) : dueDate,
                event.currentTarget.value,
              );
            }}
          />
        </div>
      </div>
      <NativeSelect
        size="sm"
        label="Recurring"
        disabled={draft.due === ""}
        value={draft.repeat}
        data={[...NEVER, ...options(REPEATS)]}
        onChange={event => {
          set({ repeat: event.currentTarget.value });
        }}
      />
      <NativeSelect
        size="sm"
        label="Set due date reminder"
        disabled={draft.due === ""}
        value={draft.reminder}
        data={[...NONE, ...options(REMINDERS)]}
        onChange={event => {
          set({ reminder: event.currentTarget.value });
        }}
      />
      <p className={classes.note}>
        Reminders will be sent to all members of this card when accounts exist.
      </p>
      <Button
        onClick={() => {
          onChange(
            withDates(props, {
              ...draft,
              start: startOn ? draft.start : "",
              due: dueOn ? draft.due : "",
            }),
          );
          close();
        }}
      >
        Save
      </Button>
      <Button
        variant="subtle"
        color="gray"
        onClick={() => {
          onChange(withDates(props, NOTHING));
          close();
        }}
      >
        Remove
      </Button>
    </div>
  );
}
