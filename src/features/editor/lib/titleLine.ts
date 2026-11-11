import { Decoration, EditorView } from "@codemirror/view";

// Styles the first line as the card title.
export const titleLine = [
  EditorView.decorations.of(
    Decoration.set([Decoration.line({ class: "cm-title-line" }).range(0)]),
  ),
  EditorView.baseTheme({
    ".cm-title-line": {
      color: "var(--color-text)",
      fontSize: "1.09em",
      fontWeight: "500",
    },
  }),
];
