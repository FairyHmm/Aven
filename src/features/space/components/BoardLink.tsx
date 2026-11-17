import { ActionIcon, Group, Menu, Paper, Text, TextInput } from "@mantine/core";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import type { Board } from "../lib/types";

type Props = {
  spaceId: string;
  board: Board;
  canEdit: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
};

export function BoardLink({
  spaceId,
  board,
  canEdit,
  onRename,
  onDelete,
}: Props) {
  const matchRoute = useMatchRoute();
  const active =
    matchRoute({
      to: "/s/$spaceId/$boardId",
      params: { spaceId, boardId: board.id },
    }) !== false;
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(board.name);

  if (renaming) {
    return (
      <form
        onSubmit={event => {
          event.preventDefault();
          if (draft.trim() !== "") onRename(draft);
          setRenaming(false);
        }}
      >
        <TextInput
          size="xs"
          autoFocus
          value={draft}
          onChange={event => {
            setDraft(event.currentTarget.value);
          }}
          onBlur={() => {
            if (draft.trim() !== "" && draft !== board.name) onRename(draft);
            setRenaming(false);
          }}
          onKeyDown={event => {
            if (event.key === "Escape") setRenaming(false);
          }}
        />
      </form>
    );
  }

  return (
    <Paper
      px="sm"
      py={6}
      radius="sm"
      bg={active ? "var(--mantine-color-default-hover)" : "transparent"}
    >
      <Group justify="space-between" gap={4} wrap="nowrap">
        <Link
          to="/s/$spaceId/$boardId"
          params={{ spaceId, boardId: board.id }}
          draggable={false}
          style={{
            color: "inherit",
            textDecoration: "none",
            flex: 1,
            minWidth: 0,
          }}
        >
          <Text size="sm" fw={active ? 600 : 400} truncate>
            {board.name}
          </Text>
        </Link>

        {canEdit && (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                size="xs"
                variant="subtle"
                color="gray"
                aria-label={`Board options for ${board.name}`}
              >
                <MoreHorizontal size={13} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<Pencil size={13} />}
                onClick={() => {
                  setDraft(board.name);
                  setRenaming(true);
                }}
              >
                Rename
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<Trash2 size={13} />}
                onClick={onDelete}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </Paper>
  );
}
