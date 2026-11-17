// Inline HTML tags the live preview draws as formatting, `<sub>2</sub>` as a
// small lowered 2 with the tags hidden until the caret is in it.
const TAGS = "b|i|u|ins|kbd|small|sub|sup|mark";
const OPEN = new RegExp(`<(${TAGS})>`, "gi");

export type HtmlPair = {
  tag: string;
  // The whole thing, `<sub>2</sub>`, and the text between the tags.
  from: number;
  to: number;
  openEnd: number;
  closeStart: number;
};

// The pairs on one line of text, which starts at `offset` in the document. A
// tag without its closing tag on the same line is left alone.
export function findHtmlPairs(text: string, offset: number): HtmlPair[] {
  const lower = text.toLowerCase();
  const pairs: HtmlPair[] = [];
  for (const open of text.matchAll(OPEN)) {
    const tag = open[1]?.toLowerCase();
    const start = open.index;
    if (tag === undefined) {
      continue;
    }
    const openEnd = start + open[0].length;
    const closeStart = lower.indexOf(`</${tag}>`, openEnd);
    if (closeStart !== -1) {
      pairs.push({
        tag,
        from: offset + start,
        to: offset + closeStart + tag.length + 3,
        openEnd: offset + openEnd,
        closeStart: offset + closeStart,
      });
    }
  }
  return pairs;
}
