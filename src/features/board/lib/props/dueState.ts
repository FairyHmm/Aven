import { isPast } from "./defaults";

// How a due date stands against today, for the card's date chip.

export type DueState = "overdue" | "today" | "soon";

const DAY = 86_400_000;
const DATE = /^(\d{4})-(\d{2})-(\d{2})/;

// Whole days from today to the day of `value` (negative: that day has gone).
function daysAway(value: string, now: Date): number | undefined {
  const match = DATE.exec(value);
  if (match === null) {
    return undefined;
  }
  const [, year = "", month = "", day = ""] = match;
  const due = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - today.getTime()) / DAY);
}

// Overdue once it has passed; "today" on its day; "soon" the day after.
export function dueState(
  value: string,
  now = new Date(),
): DueState | undefined {
  if (value === "") {
    return undefined;
  }
  if (isPast(value, now)) {
    return "overdue";
  }
  const days = daysAway(value, now);
  if (days === 0) {
    return "today";
  }
  return days === 1 ? "soon" : undefined;
}

// What a date with no time of day is called when it is near: yesterday, today,
// tomorrow. (A date with a time keeps its time.)
export function dueWord(value: string, now = new Date()): string | undefined {
  if (value === "" || value.includes("T")) {
    return undefined;
  }
  const days = daysAway(value, now);
  if (days === -1) {
    return "Yesterday";
  }
  if (days === 0) {
    return "Today";
  }
  return days === 1 ? "Tomorrow" : undefined;
}
