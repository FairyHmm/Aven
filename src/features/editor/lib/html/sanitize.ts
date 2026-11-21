import type { Options } from "react-markdown";
import rehypeRaw from "rehype-raw";

import { remarkHtmlOptions, sanitizeSteps } from "./sanitizeStep";

// Goes first among the rehype plugins, and the markdown-to-HTML step must keep
// the raw HTML for it to read.
export const rehypeHtml: NonNullable<Options["rehypePlugins"]> = [
  rehypeRaw,
  ...sanitizeSteps,
];

export { remarkHtmlOptions };
