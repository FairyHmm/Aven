// The board's keyboard shortcuts, in the order the cheat sheet shows them.
// (The keys themselves are handled in hooks/: useQuickEditKey, useUndoKeys and
// useBoardKeys; keep this list in step with them.)

export type Shortcut = { keys: string[]; what: string };
export type ShortcutGroup = { title: string; items: Shortcut[] };

export const SHORTCUTS: ShortcutGroup[] = [
  {
    title: "Move around",
    items: [
      { keys: ["←", "↑", "↓", "→"], what: "Go to the next card" },
      { keys: ["Enter"], what: "Open the card" },
      { keys: ["/"], what: "Search the cards on this board" },
    ],
  },
  {
    title: "Cards",
    items: [
      { keys: ["N"], what: "Add a card to this column" },
      { keys: ["E"], what: "Edit the card in place" },
      { keys: ["L"], what: "Labels (while editing)" },
      { keys: ["D"], what: "Dates (while editing)" },
      { keys: ["M"], what: "Members (while editing)" },
      { keys: ["A"], what: "Archive the card, or restore it" },
      {
        keys: ["Alt", "←↑↓→"],
        what: "Move the card a step (into the archive too)",
      },
    ],
  },
  {
    title: "Board",
    items: [
      { keys: ["Ctrl", "Z"], what: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], what: "Redo" },
      { keys: ["?"], what: "Show this list" },
    ],
  },
];
