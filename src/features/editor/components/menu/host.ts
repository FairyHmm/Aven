import {
  applyEdit,
  type Command,
  type Edit,
  type Range,
} from "../../lib/format/edit";

// The text a menu works on: the document, or one cell of a table.
export type Host = {
  // The text and the selection as the menu opened.
  read: () => { text: string; from: number; to: number };
  apply: (edit: Edit) => void;
  select: (from: number, to: number) => void;
};

// A textarea (a table cell). The text lives in the table, so a change goes
// out through `set` and the selection is put back once it has been drawn.
export function fieldHost(
  field: HTMLTextAreaElement,
  selection: Range,
  set: (value: string) => void,
): Host {
  const restore = (from: number, to: number) => {
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(Math.min(from, to), Math.max(from, to));
    });
  };
  return {
    read: () => ({ text: field.value, ...selection }),
    apply: edit => {
      set(applyEdit(field.value, edit));
      restore(edit.anchor, edit.head);
    },
    select: restore,
  };
}

// Runs a command on the host's text and selection, as a key press would.
export function runCommand(host: Host, command: Command): void {
  const { text, from, to } = host.read();
  const edit = command(text, { from, to });
  if (edit !== undefined) {
    host.apply(edit);
  }
}

// Runs a command on a cell's text and its selection, as a key press would.
export function runOnField(
  field: HTMLTextAreaElement,
  command: Command,
  set: (value: string) => void,
): void {
  const selection = { from: field.selectionStart, to: field.selectionEnd };
  runCommand(fieldHost(field, selection, set), command);
}
