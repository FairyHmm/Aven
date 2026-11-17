import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";

// Whether a position is in code, where markdown is not interpreted.
export function inCode(state: EditorState, pos: number): boolean {
  for (let node = syntaxTree(state).resolveInner(pos, 1); ;) {
    if (/^(FencedCode|CodeBlock|InlineCode|CommentBlock)$/.test(node.name)) {
      return true;
    }
    if (node.parent === null) {
      return false;
    }
    node = node.parent;
  }
}
