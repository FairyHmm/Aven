import { applyEdit, type Command } from "./edit";

// Runs a command on text whose selection is written «like this» (a caret is
// `|`), and gives the text back written the same way.
export function run(command: Command, source: string): string {
  const open = source.indexOf("«");
  const close = source.indexOf("»");
  const caret = source.indexOf("|");
  const clean = source.replace("«", "").replace("»", "").replace("|", "");
  const from = open >= 0 ? open : caret;
  const to = open >= 0 ? close - 1 : caret;
  const edit = command(clean, { from, to });
  if (edit === undefined) {
    return source;
  }
  const out = applyEdit(clean, edit);
  const start = Math.min(edit.anchor, edit.head);
  const end = Math.max(edit.anchor, edit.head);
  return start === end
    ? `${out.slice(0, start)}|${out.slice(start)}`
    : `${out.slice(0, start)}«${out.slice(start, end)}»${out.slice(end)}`;
}
