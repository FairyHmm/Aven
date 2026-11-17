import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Menu,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { MoreVertical, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { useSpaceActions, useSpaces } from "../hooks/useSpaces";
import type { Space } from "../lib/types";
import { DeleteSpaceModal, SpaceNameModal } from "./SpaceModals";

export function SpacesPage() {
  const { user } = useAuth();
  const { spaces, status, error } = useSpaces();
  const { createSpace, renameSpace, deleteSpace, dismissError } =
    useSpaceActions();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Space>();
  const [deleting, setDeleting] = useState<Space>();

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Spaces</Title>
        <Button
          size="xs"
          leftSection={<Plus size={14} />}
          onClick={() => {
            setCreating(true);
          }}
        >
          New space
        </Button>
      </Group>

      {error !== undefined && (
        <Alert
          color="red"
          variant="light"
          withCloseButton
          onClose={dismissError}
        >
          {error}
        </Alert>
      )}

      {status !== "ready" ? (
        <Text c="dimmed" size="sm">
          Loading spaces…
        </Text>
      ) : spaces.length === 0 ? (
        <Text c="dimmed" size="sm">
          No spaces yet. Create one to start a board.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {spaces.map(space => {
            const role =
              user === null ? undefined : space.members[user.uid]?.role;
            const canEdit = role === "owner" || role === "editor";
            const isOwner = user?.uid === space.ownerId;
            return (
              <Paper key={space.id} withBorder p="sm" radius="md" h="100%">
                <Group justify="space-between" wrap="nowrap">
                  <Link
                    to="/s/$spaceId"
                    params={{ spaceId: space.id }}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Text fw={600} truncate>
                      {space.name}
                    </Text>
                    <Group gap={4} c="dimmed" mt={2}>
                      <Users size={12} />
                      <Text size="xs">
                        {space.memberIds.length}{" "}
                        {space.memberIds.length === 1 ? "member" : "members"}
                      </Text>
                    </Group>
                  </Link>

                  {canEdit && (
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          aria-label={`Space options for ${space.name}`}
                        >
                          <MoreVertical size={15} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<Pencil size={14} />}
                          onClick={() => {
                            setEditing(space);
                          }}
                        >
                          Rename
                        </Menu.Item>
                        {isOwner && (
                          <Menu.Item
                            color="red"
                            leftSection={<Trash2 size={14} />}
                            onClick={() => {
                              setDeleting(space);
                            }}
                          >
                            Delete
                          </Menu.Item>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </Group>
              </Paper>
            );
          })}
        </SimpleGrid>
      )}

      {creating && (
        <SpaceNameModal
          opened
          title="New space"
          submitLabel="Create"
          onClose={() => {
            setCreating(false);
          }}
          onSubmit={async name => {
            await createSpace(name);
          }}
        />
      )}

      {editing !== undefined && (
        <SpaceNameModal
          opened
          title="Rename space"
          initial={editing.name}
          submitLabel="Save"
          onClose={() => {
            setEditing(undefined);
          }}
          onSubmit={name => renameSpace(editing.id, name)}
        />
      )}

      <DeleteSpaceModal
        space={deleting}
        onClose={() => {
          setDeleting(undefined);
        }}
        onConfirm={deleteSpace}
      />
    </Stack>
  );
}
