import type { LabelColor } from "../../lib/labels/labelColors";
import type { PickerKind } from "../../lib/labels/pickerKinds";
import type { TagColors } from "../../lib/labels/tags";

// Props for the shared label/option picker popup.
export type Picker = {
  kind: PickerKind;
  colors: TagColors;
  // What the card already has.
  selected: string[];
  // Every name known on the board (a dropdown's options, the board's labels).
  known: string[];
  onChange: (tags: string[]) => void;
  // Make a name, with its colour, before it is ticked.
  onCreate: (tag: string, color: LabelColor) => void;
  // Rename or recolour one (a pencil on its bar).
  onSave: (from: string, to: string, color: LabelColor) => void;
  onRemove: ((tag: string) => void) | undefined;
  // Reorder the known list (a dropdown's options), by drag or Alt + arrow.
  onMove: ((tag: string, to: number) => void) | undefined;
  title?: string;
  footer?: React.ReactNode;
  close: () => void;
};

// The two views of the popup: the list, or the form of one name.
export type View = { kind: "list" } | { kind: "edit"; tag: string };
