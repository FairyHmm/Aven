import rehypeCallouts from "rehype-callouts";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

import { type BodyProps, MarkdownBody, rehypePluginsFor } from "./MarkdownBody";

const plugins = rehypePluginsFor({
  raw: rehypeRaw,
  callouts: rehypeCallouts,
  highlight: [rehypeHighlight, { detect: false, ignoreMissing: true }],
});

// The full pipeline, with the HTML parser, callouts and the code highlighter. It is
// loaded on demand (see MarkdownView), because together they are a large part
// of the app and most cards need neither.
export function MarkdownRich(props: BodyProps) {
  return <MarkdownBody {...props} rehypePlugins={plugins} />;
}
