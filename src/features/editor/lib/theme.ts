import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

// The editor draws with the app's own tokens (styles/theme.css), so it follows
// the palette without a separate colour scheme.
const frame = EditorView.theme(
  {
    "&": {
      color: "var(--color-text-muted)",
      backgroundColor: "var(--color-bg-deep)",
      border:
        "1px solid color-mix(in oklab, var(--color-border) 35%, transparent)",
      borderRadius: "8px",
    },
    "&.cm-focused": {
      outline: "2px solid var(--color-primary-hover)",
      outlineOffset: "1px",
    },
    ".cm-scroller": {
      fontFamily: "var(--mantine-font-family)",
      lineHeight: "1.65",
      maxHeight: "52vh",
      minHeight: "11rem",
      overflow: "auto",
    },
    ".cm-content": { padding: "12px 14px", caretColor: "var(--color-text)" },
    ".cm-line": { padding: "0" },
    ".cm-cursor": { borderLeftColor: "var(--color-text)" },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground":
      { background: "var(--color-primary-muted)" },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  { tag: tags.heading1, fontSize: "1.55em", fontWeight: "700" },
  { tag: tags.heading2, fontSize: "1.3em", fontWeight: "700" },
  { tag: tags.heading3, fontSize: "1.12em", fontWeight: "650" },
  { tag: [tags.heading4, tags.heading5, tags.heading6], fontWeight: "650" },
  { tag: tags.strong, fontWeight: "700", color: "var(--color-text)" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through", opacity: "0.7" },
  { tag: tags.link, color: "var(--color-primary-hover)" },
  {
    tag: tags.url,
    color: "var(--color-ac)",
    textDecoration: "underline",
  },
  {
    tag: tags.monospace,
    fontFamily: "var(--mantine-font-family-monospace)",
    fontSize: "0.9em",
    color: "var(--color-text-subtle)",
  },
  { tag: tags.quote, fontStyle: "italic", color: "var(--color-ac)" },
  // The markers that stay visible (cursor in the element, lists, fences).
  { tag: tags.processingInstruction, color: "var(--color-fg)" },
  { tag: tags.list, color: "var(--color-ac)" },
  { tag: tags.contentSeparator, color: "var(--color-fg)" },
  { tag: tags.meta, color: "var(--color-fg)" },
]);

export const editorTheme = [frame, syntaxHighlighting(highlight)];
