import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { useMemo, useRef, useState } from "react";

import { emojiOf, type Hue } from "../lib/highlight/highlights";
import {
  chooseColour,
  chooseTask,
  COLOUR_CHOICES,
  type Hint,
  hintAt,
  isPrompt,
} from "../lib/hints";
import { TASK_STATES, type TaskState } from "../lib/tasks";

// The hint on show, and where it hangs (viewport pixels).
export type ShownHint = { hint: Hint; x: number; y: number };

const count = (hint: Hint) =>
  hint.kind === "task" ? TASK_STATES.length : COLOUR_CHOICES.length;

// Tells where the caret is being asked for a colour or a kind of task, so a
// menu can be drawn there; and gives it the keys while it is (arrows move,
// Tab and Enter pick, Esc closes). It never takes the focus.
export function useHints() {
  const view = useRef<EditorView | null>(null);
  const [shown, setShown] = useState<ShownHint>();
  const [active, setActive] = useState(0);
  // The refs are what the keys read; the state is what is drawn.
  const current = useRef<ShownHint | undefined>(undefined);
  const index = useRef(0);
  // After a pick the menu stays shut until the caret moves or text is typed.
  const quiet = useRef<number | undefined>(undefined);

  const show = (next: ShownHint | undefined) => {
    if (next?.hint.kind !== current.current?.hint.kind) {
      index.current = 0;
      setActive(0);
    }
    current.current = next;
    setShown(next);
  };
  const move = (to: number) => {
    index.current = to;
    setActive(to);
  };
  const pickTask = (hint: Hint, state: TaskState) => {
    if (view.current !== null) {
      chooseTask(view.current, hint, state);
    }
  };
  const pickHue = (hint: Hint, hue: Hue) => {
    if (view.current !== null) {
      chooseColour(view.current, hint, emojiOf(hue));
    }
  };
  // The choice the keys are on, by its place in the menu.
  const pickAt = (hint: Hint, at: number) => {
    if (hint.kind === "task") {
      pickTask(hint, TASK_STATES[at]?.char ?? " ");
    } else {
      pickHue(hint, COLOUR_CHOICES[at] ?? "default");
    }
  };

  const extension = useMemo(() => {
    // Keys only while a prompt is open; otherwise they are the editor's.
    const when = (run: (shown: ShownHint) => void) => () => {
      const now = current.current;
      if (now === undefined || !isPrompt(now.hint)) {
        return false;
      }
      run(now);
      return true;
    };
    const choose = when(now => {
      pickAt(now.hint, index.current);
    });
    return [
      Prec.highest(
        keymap.of([
          {
            key: "ArrowDown",
            run: when(now => {
              move((index.current + 1) % count(now.hint));
            }),
          },
          {
            key: "ArrowUp",
            run: when(now => {
              move((index.current + count(now.hint) - 1) % count(now.hint));
            }),
          },
          { key: "Tab", run: choose },
          { key: "Enter", run: choose },
          {
            key: "Escape",
            stopPropagation: true,
            run: when(() => {
              quiet.current = view.current?.state.selection.main.head;
              show(undefined);
            }),
          },
        ]),
      ),
      EditorView.updateListener.of(update => {
        view.current = update.view;
        const head = update.state.selection.main.head;
        if (update.transactions.some(tr => tr.isUserEvent("input.pick"))) {
          quiet.current = head;
          show(undefined);
          return;
        }
        if (
          !(update.docChanged || update.selectionSet || update.focusChanged)
        ) {
          return;
        }
        if (quiet.current !== undefined) {
          if (head === quiet.current && !update.docChanged) {
            return;
          }
          quiet.current = undefined;
        }
        const hint = update.view.hasFocus ? hintAt(update.state) : undefined;
        if (hint === undefined) {
          show(undefined);
          return;
        }
        // The layout cannot be read while the editor updates.
        update.view.requestMeasure({
          read: target => target.coordsAtPos(head),
          write: at => {
            show(at === null ? undefined : { hint, x: at.left, y: at.top });
          },
        });
      }),
    ];
    // The functions only touch refs and setters, which do not change.
    // oxlint-disable-next-line react/exhaustive-deps
  }, []);

  return { extension, view, shown, active, pickTask, pickHue, setActive: move };
}

export type HintsState = ReturnType<typeof useHints>;
