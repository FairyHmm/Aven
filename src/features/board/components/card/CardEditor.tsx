import { useRef, useState } from "react";

import { glideAround } from "../../../../shared/lib/dnd/glide";
import { CodeEditor } from "../../../editor/components/CodeEditor";
import { useBoardActions } from "../../hooks/useBoardActions";
import { useCloseCard } from "../../hooks/useCardEditor";
import { joinCard, splitCard } from "../../lib/text";
import type { Card } from "../../lib/types";
import { useEditorStore } from "../../stores/editorStore";
import { PropsRow } from "./PropsRow";
import { QuickMenu } from "./QuickMenu";

import classes from "./card.module.css";

// The popups of the property buttons live in portals, outside the tile.
const inPopup = (node: EventTarget | null) =>
  node instanceof Element && node.closest("[data-keep-editing]") !== null;

// Esc in a property popup closes the popup, not the edit.
const inProperty = (node: EventTarget | null) =>
  node instanceof Element && node.closest("[data-popup]") !== null;

// A card edited where it sits: the title and notes as one markdown text, the
// properties as controls above it. Save is the first action of the menu beside
// the tile (so the tile itself never changes size for it); there is no need to
// press it: it saves when focus leaves the tile, on Esc or on Ctrl/⌘ + Enter. Moving between the
// text and the controls stays inside the tile. Starting a drag blurs it first
// (see useSortableItem).
export function CardEditor({ card }: { card: Card }) {
  const { editCard } = useBoardActions();
  const close = useCloseCard();
  const start = useRef(joinCard(card));
  const text = useRef(start.current);
  const [props, setProps] = useState(card.props);
  const latest = useRef(props);
  const finished = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  // Opened with a popup (a hotkey), the popup takes focus, not the text.
  const startedWithPopup = useRef(
    useEditorStore.getState().popup !== undefined,
  );

  const finish = () => {
    // Esc closes the editor, which then also reports a blur.
    if (finished.current) {
      return;
    }
    finished.current = true;
    const changed =
      text.current !== start.current ||
      JSON.stringify(latest.current) !== JSON.stringify(card.props);
    if (changed) {
      editCard(card.id, { ...splitCard(text.current), props: latest.current });
    }
    close();
  };

  return (
    <div
      ref={root}
      className={classes.editorBox}
      onBlur={event => {
        // The window losing focus is not leaving the card, nor is moving
        // from the text to a control inside it.
        const next = event.relatedTarget;
        if (
          !document.hasFocus() ||
          (next instanceof Node &&
            (event.currentTarget.contains(next) || inPopup(next)))
        ) {
          return;
        }
        finish();
      }}
      onKeyDown={event => {
        // Esc in a popup closes the popup, not the edit.
        if (inProperty(event.target)) {
          return;
        }
        if (
          event.key === "Escape" ||
          ((event.metaKey || event.ctrlKey) && event.key === "Enter")
        ) {
          finish();
        }
      }}
    >
      <PropsRow
        props={props}
        animate
        scope={`edit:${card.id}`}
        onDates={() => {
          useEditorStore.getState().setPopup("dates");
        }}
      />
      {/* The text glides down when a row of properties appears above it. */}
      <div data-flip={`edit-text:${card.id}`}>
        <CodeEditor
          compact
          autoFocus={!startedWithPopup.current}
          firstLineTitle
          label="Card"
          initialValue={start.current}
          hint="Title, then notes below"
          onChange={next => {
            text.current = next;
          }}
          onSubmit={finish}
          onEscape={finish}
        />
      </div>
      <QuickMenu
        card={card}
        anchor={root}
        finish={finish}
        props={props}
        onProps={next => {
          latest.current = next;
          glideAround(() => {
            setProps(next);
          });
        }}
      />
    </div>
  );
}
