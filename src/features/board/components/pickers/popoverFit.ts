// Esc in a control with this mark closes the popup it is in (or does nothing),
// and leaves the card back open; the modal looks for it on the event target.
export const STOP = { "data-mantine-stop-propagation": "true" };

// A popup's dropdown is part of the tile or card it opens from: an editor that
// ends when focus leaves its tile has to know it is still inside it.
export const MARK = { "data-keep-editing": "", "data-popup": "" };
