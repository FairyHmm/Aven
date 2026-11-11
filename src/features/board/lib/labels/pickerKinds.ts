import { normalizeTag, tagText } from "./tags";

// Picker variants for labels and dropdown options.
export type PickerKind = {
  title: string;
  noun: string;
  normalize: (input: string) => string;
  // How a name is written on its bar.
  show: (tag: string) => string;
  // Labels may be only a colour; an option needs its text.
  named: boolean;
  // Picking one replaces the last and closes the popup.
  single: boolean;
};

export const LABELS: PickerKind = {
  title: "Labels",
  noun: "label",
  normalize: normalizeTag,
  show: tagText,
  named: false,
  single: false,
};

// The options of a dropdown that takes several are ticked, as labels are.
export const MANY_OPTIONS: PickerKind = {
  title: "Options",
  noun: "option",
  normalize: input => input.trim(),
  show: tag => tag,
  named: true,
  single: false,
};

export const OPTIONS: PickerKind = {
  title: "Options",
  noun: "option",
  normalize: input => input.trim(),
  show: tag => tag,
  named: true,
  single: true,
};
