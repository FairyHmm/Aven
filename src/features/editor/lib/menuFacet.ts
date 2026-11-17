import { Facet } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

// Opens the editor's right-click menu at a point (viewport pixels). The boxes
// of the tasks are widgets that get their own right clicks, and hand them on
// through this, so there is one menu for the whole text.
export type OpenMenu = (view: EditorView, x: number, y: number) => void;

export const menuFacet = Facet.define<OpenMenu, OpenMenu | undefined>({
  combine: values => values[0],
});
