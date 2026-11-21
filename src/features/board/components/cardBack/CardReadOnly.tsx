import { Modal } from "@mantine/core";

import { MarkdownView } from "../../../editor/components/MarkdownView";
import { useModalLeave } from "../../hooks/useModalLeave";
import type { Card } from "../../lib/types";
import { PropsRow } from "../card/PropsRow";
import { AttachmentsSection } from "./AttachmentsSection";
import { MODAL_TRANSITION } from "./modalTransition";

import classes from "./cardModal.module.css";

const none = () => undefined;

// A card as someone who may only read sees it: the same modal, with the text
// shown instead of edited, and no way to change or delete anything.
export function CardReadOnly({
  card,
  onClose,
}: {
  card: Card;
  onClose: () => void;
}) {
  const { shown, leave } = useModalLeave(onClose);
  return (
    <Modal
      opened={shown}
      centered
      size={760}
      radius="lg"
      padding="lg"
      title={card.title === "" ? "Untitled" : card.title}
      onClose={() => {
        leave();
      }}
      classNames={{ title: classes.modalTitle, body: classes.modalBody }}
      overlayProps={{ blur: 6, backgroundOpacity: 0.55 }}
      zIndex={260}
      transitionProps={MODAL_TRANSITION}
    >
      <PropsRow props={card.props} />
      <MarkdownView body={card.body} />
      <AttachmentsSection
        attachments={card.attachments ?? []}
        progress={undefined}
        error={undefined}
        onClearError={none}
      />
    </Modal>
  );
}
