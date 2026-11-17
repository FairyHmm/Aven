import { Modal } from "@mantine/core";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { glideAround } from "../../../../shared/lib/dnd/glide";
import { ms } from "../../../../shared/lib/motion";
import { CodeEditor } from "../../../editor/components/CodeEditor";
import { useAttachments } from "../../hooks/useAttachments";
import { useBoardActions } from "../../hooks/useBoardActions";
import { useModalLeave } from "../../hooks/useModalLeave";
import type { Card, PopupKind, Props as PropMap } from "../../lib/types";
import { useEscapeHeld } from "../../stores/escapeStore";
import { ActionButton } from "../actions/ActionButton";
import { AttachmentsSection } from "./AttachmentsSection";
import { CardSections } from "./CardSections";
import { ListMenu } from "./ListMenu";
import { PropButtons } from "./PropButtons";

import classes from "./cardModal.module.css";

type Props = { card: Card; onClose: () => void };
type Popup = { kind: PopupKind; from: "buttons" | "sections" };

const from = (popup: Popup | undefined, part: Popup["from"]) =>
  popup?.from === part ? popup.kind : undefined;

const MODAL_TRANSITION = {
  transition: {
    in: { opacity: 1, transform: "translateY(0) scale(1)" },
    out: { opacity: 0, transform: "translateY(10px) scale(0.94)" },
    common: { transformOrigin: "center 40%" },
    transitionProperty: "transform, opacity",
  },
  duration: ms("slow"),
  exitDuration: ms("base"),
  timingFunction: "var(--spring)",
};

export function CardBack({ card, onClose }: Props) {
  const { editCard, removeCard } = useBoardActions();
  const [title, setTitle] = useState(card.title);
  const [props, setProps] = useState(card.props);
  const [body, setBody] = useState(card.body);
  const notes = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const attachments = useAttachments(card.id);
  const [popup, setPopupState] = useState<Popup>();

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
      closeOnEscape={popup === undefined && !escapeHeld}
      onClose={save}
      classNames={{ title: classes.modalTitle, body: classes.modalBody }}
      overlayProps={{ blur: 6, backgroundOpacity: 0.55 }}
      zIndex={260}
      transitionProps={MODAL_TRANSITION}
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
            notes.current
              ?.querySelector<HTMLElement>("[contenteditable]")
              ?.focus();
          }
        }}
      />
      <div className={classes.actions} data-flip="back:buttons">
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          onChange={event => {
            if (event.currentTarget.files !== null) {
              void attachments.upload(event.currentTarget.files);
              event.currentTarget.value = "";
            }
          }}
        />
        <PropButtons
          props={props}
          onChange={changeProps}
          onAttach={() => {
            fileInput.current?.click();
          }}
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
      <AttachmentsSection
        attachments={card.attachments ?? []}
        progress={attachments.progress}
        error={attachments.error}
        onClearError={attachments.clearError}
        onRemove={item => {
          void attachments.remove(item);
        }}
      />
      <div className={classes.footer} data-flip="back:footer">
        <ActionButton
          compact
          danger
          label="Delete card"
          icon={<Trash2 size={14} />}
          onClick={() => {
            leave(() => {
              removeCard(card.id);
            });
          }}
        />
      </div>
    </Modal>
  );
}
