import {
  Button,
  Group,
  Input,
  Modal,
  SegmentedControl,
  Stack,
  TextInput,
} from "@mantine/core";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { CodeEditor } from "../../editor/components/CodeEditor";
import { MarkdownView } from "../../editor/components/MarkdownView";
import { useBoardActions } from "../hooks/useBoardActions";
import { useEditedCard } from "../hooks/useCardEditor";
import type { Card } from "../lib/types";

import classes from "./card.module.css";

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

// Title plus a CodeMirror markdown body; "Preview" renders it the way a
// reader sees it, mermaid diagrams included.
function EditorDialog({ card, onClose }: Props) {
  const { editCard, removeCard } = useBoardActions();
  const [title, setTitle] = useState(card.title);
  const [body, setBody] = useState(card.body);
  const [mode, setMode] = useState("write");

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
        <Input.Wrapper
          label="Body"
          description="Markdown. Ctrl/⌘ + Enter to save."
        >
          <SegmentedControl
            size="xs"
            mt={6}
            mb={6}
            data={[
              { value: "write", label: "Write" },
              { value: "preview", label: "Preview" },
            ]}
            value={mode}
            onChange={setMode}
          />
          {mode === "write" ? (
            <CodeEditor
              initialValue={body}
              label="Card body"
              onChange={setBody}
              onSubmit={save}
            />
          ) : (
            <div className={classes.preview}>
              {body.trim() === "" ? (
                <span className={classes.empty}>Nothing to preview.</span>
              ) : (
                <MarkdownView body={body} onBodyChange={setBody} />
              )}
            </div>
          )}
        </Input.Wrapper>
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
