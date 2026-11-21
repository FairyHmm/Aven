// Which cards need the heavier markdown pieces (HTML, callouts, highlighting). Both checks only have to be
// safe, not exact: a false positive just loads the heavier view for nothing.

// A card with raw HTML needs the HTML parser (an autolink or a `<` inside code
// counts too, since the check is only for a tag-like start).
export function hasHtml(body: string): boolean {
  return /<[A-Za-z!/?]/.test(body);
}

// A fenced block with a language needs the code highlighter (mermaid and
// maths fences are drawn by other parts, so they don't count).
export function hasHighlightedCode(body: string): boolean {
  return /^[ \t]*(?:```|~~~)[ \t]*(?!(?:mermaid|math)\b)[\w+#.-]/m.test(body);
}

// A callout (`> [!note]`) needs the plugin that draws it, which parses its
// icons with the HTML parser.
export function hasCallout(body: string): boolean {
  return /^[ \t>]*>[ \t]*\[!/m.test(body);
}

export function needsRichMarkdown(body: string): boolean {
  return hasHtml(body) || hasHighlightedCode(body) || hasCallout(body);
}
