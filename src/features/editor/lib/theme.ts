import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Prec } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

// The editor draws with the app's own tokens (styles/theme.css), so it follows
// the palette without a separate colour scheme.
const frame = EditorView.theme(
  {
    "&": { color: "var(--color-text-muted)" },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": {
      fontFamily: "var(--mantine-font-family)",
      lineHeight: "1.65",
      maxHeight: "52vh",
      overflow: "auto",
    },
    // The minimum height belongs to the content, not the scroller: the empty
    // part under the last line is then the text's own, and a click there puts
    // the cursor at the end.
    ".cm-content": {
      padding: "12px 14px",
      minHeight: "11rem",
      caretColor: "var(--color-text)",
    },
    ".cm-line": { padding: "0" },
    ".aven-code": {
      padding: "0 8px",
      fontFamily: "var(--mantine-font-family-monospace)",
      fontSize: "0.9em",
      background: "var(--color-code)",
    },
    ".aven-html-b": { fontWeight: "700" },
    ".aven-html-i": { fontStyle: "italic" },
    ".aven-html-u, .aven-html-ins": { textDecoration: "underline" },
    ".aven-html-small": { fontSize: "0.8em" },
    ".aven-html-sub, .aven-html-sup": { fontSize: "0.75em" },
    ".aven-html-sub": { verticalAlign: "sub" },
    ".aven-html-sup": { verticalAlign: "super" },
    ".aven-html-mark": {
      padding: "0 0.2em",
      background: "color-mix(in oklab, var(--color-primary) 30%, transparent)",
      borderRadius: "3px",
    },
    ".aven-html-kbd": {
      padding: "0 0.35em",
      fontFamily: "var(--font-mono, monospace)",
      fontSize: "0.88em",
      border:
        "1px solid color-mix(in oklab, var(--color-border) 60%, transparent)",
      borderRadius: "4px",
    },
    ".aven-bullet": { color: "var(--color-ac)", paddingRight: "0.5em" },
    ".aven-diagram": { padding: "4px 0" },
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
  // Code inside fences.
  {
    tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword],
    color: "var(--accent-violet)",
  },
  { tag: [tags.string, tags.regexp], color: "var(--accent-emerald)" },
  {
    tag: [tags.number, tags.bool, tags.null, tags.atom],
    color: "var(--accent-amber)",
  },
  {
    tag: [tags.comment, tags.lineComment, tags.blockComment],
    color: "var(--color-fg)",
    fontStyle: "italic",
  },
  {
    tag: [tags.function(tags.variableName), tags.propertyName],
    color: "var(--accent-sky)",
  },
  { tag: [tags.typeName, tags.className], color: "var(--accent-amber)" },
  { tag: [tags.tagName, tags.attributeName], color: "var(--accent-rose)" },
  { tag: tags.operator, color: "var(--color-ac)" },
]);

export const editorTheme = [frame, syntaxHighlighting(highlight)];

// The editor sitting inside a card tile: no frame of its own, the tile is the
// frame, and it only takes the room its text needs.
export const compactTheme = Prec.high(
  EditorView.theme(
    {
      "&": { fontSize: "0.8rem" },
      ".cm-scroller": { maxHeight: "18rem" },
      ".cm-content": { padding: "0", minHeight: "0" },
    },
    { dark: true },
  ),
);
