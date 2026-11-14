import {
  ActionIcon,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useMatchRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

import { SortableItem } from "../../../shared/components/SortableItem";
import { useAutoScroll } from "../../../shared/hooks/useAutoScroll";
import { useSortableDrop } from "../../../shared/hooks/useSortableDrop";
import { useSortableList } from "../../../shared/hooks/useSortableList";
import { useAuth } from "../../auth/hooks/useAuth";
import { useBoards, useSpaceActions } from "../hooks/useSpaces";
import type { Space } from "../lib/types";
import { BoardLink } from "./BoardLink";
import { SpaceMembersModal } from "./SpaceMembersModal";

export function SpaceSidebar({ space }: { space: Space }) {
  const { user } = useAuth();
  const { boards } = useBoards(space.id);
  const { createBoard, renameBoard, deleteBoard, moveBoard } =
    useSpaceActions();
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [membersOpen, setMembersOpen] = useState(false);

  const list = useRef<HTMLDivElement>(null);
  useAutoScroll(list);
  useSortableList(list, {
    kind: "board",
    listId: space.id,
    axis: "vertical",
    gap: 4,
    count: boards.length,
  });
  useSortableDrop("board", dropped => {
    void moveBoard(space.id, dropped.id, dropped.index);
  });

  const role = user === null ? undefined : space.members[user.uid]?.role;
  const canEdit = role === "owner" || role === "editor";

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (newName.trim() === "") return;
    const created = await createBoard(space.id, newName);
    setNewName("");
    setAdding(false);
    if (created !== undefined) {
      void navigate({
        to: "/s/$spaceId/$boardId",
        params: { spaceId: space.id, boardId: created.id },
      });
    }
  };

  const handleDelete = async (boardId: string) => {
    const active =
      matchRoute({
        to: "/s/$spaceId/$boardId",
        params: { spaceId: space.id, boardId },
      }) !== false;
    const next = boards.find(item => item.id !== boardId);
    await deleteBoard(space.id, boardId);
    if (active) {
      if (next !== undefined) {
        void navigate({
          to: "/s/$spaceId/$boardId",
          params: { spaceId: space.id, boardId: next.id },
          replace: true,
        });
      } else {
        void navigate({
          to: "/s/$spaceId",
          params: { spaceId: space.id },
          replace: true,
        });
      }
    }
  };

  return (
    <Stack w={200} gap="xs">
      <Group justify="space-between" px="xs">
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Boards
        </Text>
        {canEdit && (
          <ActionIcon
            size="sm"
            variant="subtle"
            aria-label="New board"
            onClick={() => {
              setAdding(v => !v);
            }}
          >
            <Plus size={14} />
          </ActionIcon>
        )}
      </Group>

      {adding && (
        <form onSubmit={event => void handleCreate(event)}>
          <Stack gap={4} px={4}>
            <TextInput
              size="xs"
              placeholder="Board name"
              autoFocus
              value={newName}
              onChange={event => {
                setNewName(event.currentTarget.value);
              }}
              onKeyDown={event => {
                if (event.key === "Escape") {
                  setAdding(false);
                  setNewName("");
                }
              }}
            />
          </Stack>
        </form>
      )}

      <Stack ref={list} gap={4}>
        {boards.map((board, index) => (
          <SortableItem
            key={board.id}
            kind="board"
            id={board.id}
            listId={space.id}
            axis="vertical"
            index={index}
            count={boards.length}
          >
            <BoardLink
              spaceId={space.id}
              board={board}
              canEdit={canEdit}
              onRename={name => void renameBoard(space.id, board.id, name)}
              onDelete={() => void handleDelete(board.id)}
            />
          </SortableItem>
        ))}
      </Stack>

      <Button
        variant="subtle"
        color="gray"
        size="xs"
        justify="flex-start"
        leftSection={<Users size={14} />}
        onClick={() => {
          setMembersOpen(true);
        }}
      >
        Members ({space.memberIds.length})
      </Button>

      <SpaceMembersModal
        space={space}
        opened={membersOpen}
        onClose={() => {
          setMembersOpen(false);
        }}
      />
    </Stack>
  );
}
