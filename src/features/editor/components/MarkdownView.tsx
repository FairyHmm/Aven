import { lazy, Suspense } from "react";

import { needsRichMarkdown } from "../lib/html/needs";
import {
  type BodyProps,
  liteRehypePlugins,
  MarkdownBody,
} from "./MarkdownBody";

const loadRich = () => import("./MarkdownRich");
const Rich = lazy(() =>
  loadRich().then(module => ({ default: module.MarkdownRich })),
);

// Renders a card body: GFM, frontmatter hidden, mermaid fences as diagrams,
// task lists as clickable boxes. Most cards are plain text and use the light
// pipeline; one with HTML or a code block in a named language switches to the
// full one when it has loaded (and shows the light one until then).
export function MarkdownView(props: BodyProps) {
  const light = <MarkdownBody {...props} rehypePlugins={liteRehypePlugins} />;
  return needsRichMarkdown(props.body) ? (
    <Suspense fallback={light}>
      <Rich {...props} />
    </Suspense>
  ) : (
    light
  );
}
