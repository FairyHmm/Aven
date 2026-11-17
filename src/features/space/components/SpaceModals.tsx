import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { type FormEvent, useState } from "react";

import type { Space } from "../lib/types";

type NameModalProps = {
  opened: boolean;
  title: string;
  initial?: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

export function SpaceNameModal({
  opened,
  title,
  initial = "",
  submitLabel,
  onClose,
  onSubmit,
}: NameModalProps) {
  const [name, setName] = useState(initial);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (name.trim() === "") return;
    await onSubmit(name);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <form onSubmit={event => void handleSubmit(event)}>
        <Stack gap="sm">
          <TextInput
            label="Space name"
            placeholder="e.g. IT3120 Team"
            required
            autoFocus
            value={name}
            onChange={event => {
              setName(event.currentTarget.value);
            }}
          />
          <Group justify="flex-end">
            <Button type="submit">{submitLabel}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

type DeleteModalProps = {
  space: Space | undefined;
  onClose: () => void;
  onConfirm: (spaceId: string) => Promise<void>;
};

export function DeleteSpaceModal({
  space,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  return (
    <Modal
      opened={space !== undefined}
      onClose={onClose}
      title="Delete space"
      centered
    >
      <Stack gap="md">
        <Text size="sm">
          Delete <strong>{space?.name}</strong> and all of its boards?
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              if (space !== undefined) {
                void onConfirm(space.id);
              }
              onClose();
            }}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
