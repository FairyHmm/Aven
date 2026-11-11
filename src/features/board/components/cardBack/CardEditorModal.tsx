import { Modal } from "@mantine/core";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { glideAround } from "../../../../shared/lib/dnd/glide";
import { ms } from "../../../../shared/lib/motion";
import { CodeEditor } from "../../../editor/components/CodeEditor";
import { useBoardActions } from "../../hooks/useBoardActions";
import { useOpenedCard } from "../../hooks/useCardEditor";
import { useModalLeave } from "../../hooks/useModalLeave";
import type { Card, PopupKind, Props as PropMap } from "../../lib/types";
import { useEscapeHeld } from "../../stores/escapeStore";
import { ActionButton } from "../actions/ActionButton";
import { CardSections } from "./CardSections";
import { ListMenu } from "./ListMenu";
import { PropButtons } from "./PropButtons";

import classes from "./cardModal.module.css";

// The modal of whichever card is open (see stores/editorStore.ts); renders
// nothing while none is.
export function CardEditorModal() {
  const { card, close } = useOpenedCard();
  if (card === undefined) {
    return null;
  }
  return <CardBack key={card.id} card={card} onClose={close} />;
}

type Props = { card: Card; onClose: () => void };

// The open popup, and which part of the card back it opened from: the buttons
// or the sections. Only that part holds it, so a property the card gains
// while its popup is open doesn't open it twice.
type Popup = { kind: PopupKind; from: "buttons" | "sections" };

const from = (popup: Popup | undefined, part: Popup["from"]) =>
  popup?.from === part ? popup.kind : undefined;

// Card-back editor: title, properties, and markdown body.
function CardBack({ card, onClose }: Props) {
  const { editCard, removeCard } = useBoardActions();
  const [title, setTitle] = useState(card.title);
  const [props, setProps] = useState(card.props);
  const [body, setBody] = useState(card.body);
  const notes = useRef<HTMLDivElement>(null);
  const [popup, setPopupState] = useState<Popup>();
  // What is added to or taken from the card back moves what is under it:
  // those glide to their new places instead of jumping.
  const changeProps = (next: PropMap) => {
    glideAround(() => {
      setProps(next);
    });
  };
  const setPopup = (next: Popup | undefined) => {
    glideAround(() => {
      setPopupState(next);
    });
  };
  const escapeHeld = useEscapeHeld();
  const { shown, leave } = useModalLeave(onClose);

  const save = () => {
    const changed =
      title !== card.title ||
      body !== card.body ||
      JSON.stringify(props) !== JSON.stringify(card.props);
    if (changed) {
      editCard(card.id, { title, body, props });
    }
    leave();
  };

  return (
    <Modal
      opened={shown}
      centered
      size={760}
      radius="lg"
      padding="lg"
      title={<ListMenu card={card} />}
      // Esc in a popup (a property popup, a dropdown, a menu) closes the
      // popup, not the card.
      closeOnEscape={popup === undefined && !escapeHeld}
      onClose={save}
      classNames={{ title: classes.modalTitle, body: classes.modalBody }}
      overlayProps={{ blur: 6, backgroundOpacity: 0.55 }}
      // Above the quick-edit menu, which can still be leaving when the card
      // opens from it (that menu sits at 250).
      zIndex={260}
      // It rises and settles on the same spring as the quick-edit menu, and
      // goes quicker than it came.
      transitionProps={{
        transition: {
          in: { opacity: 1, transform: "translateY(0) scale(1)" },
          out: { opacity: 0, transform: "translateY(10px) scale(0.94)" },
          common: { transformOrigin: "center 40%" },
          transitionProperty: "transform, opacity",
        },
        duration: ms("slow"),
        exitDuration: ms("base"),
        timingFunction: "var(--spring)",
      }}
    >
      <input
        className={classes.title}
        aria-label="Title"
        placeholder="Title"
        data-autofocus
        value={title}
        onChange={event => {
          setTitle(event.currentTarget.value);
        }}
        onKeyDown={event => {
          if (event.key === "Enter") {
            event.preventDefault();
            // On to the notes.
            notes.current
              ?.querySelector<HTMLElement>("[contenteditable]")
              ?.focus();
          }
        }}
      />
      <div className={classes.actions} data-flip="back:buttons">
        <PropButtons
          props={props}
          onChange={changeProps}
          popup={{
            open: from(popup, "buttons"),
            set: kind => {
              setPopup(
                kind === undefined ? undefined : { kind, from: "buttons" },
              );
            },
          }}
        />
      </div>
      <CardSections
        props={props}
        body={body}
        onChange={changeProps}
        open={from(popup, "sections")}
        onOpen={kind => {
          setPopup(kind === undefined ? undefined : { kind, from: "sections" });
        }}
        adding={
          popup?.kind === "field" || popup?.kind === "dropdown"
            ? popup.kind
            : undefined
        }
        onAdded={() => {
          setPopup(undefined);
        }}
      />
      <div ref={notes} data-flip="back:notes">
        <CodeEditor
          initialValue={body}
          label="Card notes"
          hint="Notes, tasks, diagrams… in Markdown"
          onChange={setBody}
          onSubmit={save}
        />
      </div>
      <div className={classes.footer} data-flip="back:footer">
        <ActionButton
          compact
          danger
          label="Delete card"
          icon={<Trash2 size={14} />}
          onClick={() => {
            // The card back leaves first; then the tile goes and the board
            // closes up, where it can be seen.
            leave(() => {
              removeCard(card.id);
            });
          }}
        />
      </div>
    </Modal>
  );
}
