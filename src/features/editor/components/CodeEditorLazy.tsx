import { type ComponentProps, useEffect, useState } from "react";

import type { CodeEditor as Loaded } from "./CodeEditor";

type Editor = typeof Loaded;

let editor: Editor | undefined;
let loading: Promise<void> | undefined;

// Downloads the editor (a large part of the app); safe to call as often as you
// like. useBoard calls it as soon as the board has shown, for people who can
// edit, so the first edit doesn't wait for it.
export function preloadCodeEditor(): Promise<void> {
  loading ??= import("./CodeEditor").then(
    module => {
      editor = module.CodeEditor;
    },
    () => {
      // Let the next call try again.
      loading = undefined;
    },
  );
  return loading;
}

// The card editor, loaded when first needed. Once the module is in it renders
// at once: React.lazy would suspend on its first render even then, which is
// what showed an empty editor before the text appeared.
export function CodeEditor(props: ComponentProps<typeof Loaded>) {
  const [Active, setActive] = useState<Editor | undefined>(() => editor);

  useEffect(() => {
    if (Active !== undefined) {
      return undefined;
    }
    let live = true;
    void preloadCodeEditor().then(() => {
      if (live && editor !== undefined) {
        setActive(() => editor);
      }
    });
    return () => {
      live = false;
    };
  }, [Active]);

  return Active === undefined ? (
    <div style={{ minHeight: 48 }} />
  ) : (
    <Active {...props} />
  );
}
