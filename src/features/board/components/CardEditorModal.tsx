import {
  Button,
  Group,
  Modal,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { useBoardActions } from "../hooks/useBoardActions";
import { useEditedCard } from "../hooks/useCardEditor";
import type { Card } from "../lib/types";

// The editor of whichever card is open (see stores/editorStore.ts); renders
// nothing while none is.
export function CardEditorModal() {
  const { card, close } = useEditedCard();
  if (card === undefined) {
    return null;
  }
  return <EditorDialog key={card.id} card={card} onClose={close} />;
}

type Props = { card: Card; onClose: () => void };

// Plain markdown editing for now; the CodeMirror live preview replaces the
// textarea when the editor feature lands.
function EditorDialog({ card, onClose }: Props) {
  const { editCard, removeCard } = useBoardActions();
  const [title, setTitle] = useState(card.title);
  const [body, setBody] = useState(card.body);

  const save = () => {
    editCard(card.id, { title, body });
    onClose();
  };

  return (
    <Modal
      opened
      centered
      size="lg"
      radius="lg"
      title="Edit card"
      onClose={onClose}
      overlayProps={{ blur: 6, backgroundOpacity: 0.55 }}
      transitionProps={{ transition: "pop", duration: 160 }}
    >
      <Stack
        gap="sm"
        onKeyDown={event => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            save();
          }
        }}
      >
        <TextInput
          label="Title"
          data-autofocus
          value={title}
          onChange={event => {
            setTitle(event.currentTarget.value);
          }}
        />
        <Textarea
          label="Body"
          description="Markdown. Ctrl/⌘ + Enter to save."
          autosize
          minRows={8}
          maxRows={18}
          value={body}
          styles={{
            input: { fontFamily: "var(--mantine-font-family-monospace)" },
          }}
          onChange={event => {
            setBody(event.currentTarget.value);
          }}
        />
        <Group justify="space-between" mt="xs">
          <Button
            variant="subtle"
            color="red"
            leftSection={<Trash2 size={15} />}
            onClick={() => {
              removeCard(card.id);
              onClose();
            }}
          >
            Delete
          </Button>
          <Group gap="xs">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
