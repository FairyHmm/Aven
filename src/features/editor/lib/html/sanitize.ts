import type { Options } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// HTML in a card body. Most tags work, but only what a sanitizer lets through:
// no script, no event handlers, no `style`, no `javascript:` links, no frames
// or forms (GitHub's list of allowed tags, plus a few formatting ones). Cards
// can be shared by link, so what one carries has to be safe to open.
//
// Our own plugins add attributes before the sanitizer sees the tree, so those
// are allowed by name: the task state of a list item, the hue of a highlight.
const schema: NonNullable<Parameters<typeof rehypeSanitize>[0]> = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "u", "small", "mark"],
  attributes: {
    ...defaultSchema.attributes,
    li: [...(defaultSchema.attributes?.["li"] ?? []), "dataTask", "dataOffset"],
    mark: ["dataHue"],
  },
};

// Goes first among the rehype plugins, and the markdown-to-HTML step must keep
// the raw HTML for it to read.
export const rehypeHtml: NonNullable<Options["rehypePlugins"]> = [
  rehypeRaw,
  [rehypeSanitize, schema],
];

export const remarkHtmlOptions = { allowDangerousHtml: true };
