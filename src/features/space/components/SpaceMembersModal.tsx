import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Trash2, UserPlus } from "lucide-react";
import { type FormEvent, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { useSpaceActions } from "../hooks/useSpaces";
import type { Space, SpaceRole } from "../lib/types";

type Props = {
  space: Space;
  opened: boolean;
  onClose: () => void;
};

export function SpaceMembersModal({ space, opened, onClose }: Props) {
  const { user } = useAuth();
  const { inviteMember, updateMemberRole, removeMember } = useSpaceActions();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SpaceRole>("editor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const isOwner = user?.uid === space.ownerId;
  const members = Object.values(space.members).sort(
    (a, b) => a.addedAt - b.addedAt,
  );

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    const clean = email.trim();
    if (clean === "") return;
    setBusy(true);
    setError(undefined);
    const problem = await inviteMember(space.id, clean, role);
    setBusy(false);
    if (problem !== undefined) {
      setError(problem);
      return;
    }
    setEmail("");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Members · ${space.name}`}
      centered
    >
      <Stack gap="md">
        {isOwner && (
          <form onSubmit={event => void handleInvite(event)}>
            <Stack gap="xs">
              <Group align="flex-end" gap="xs">
                <TextInput
                  label="Invite by email"
                  placeholder="teammate@example.com"
                  type="email"
                  style={{ flex: 1 }}
                  value={email}
                  onChange={event => {
                    setEmail(event.currentTarget.value);
                  }}
                />
                <Select
                  label="Role"
                  w={110}
                  value={role}
                  onChange={value => {
                    if (value === "editor" || value === "viewer") {
                      setRole(value);
                    }
                  }}
                  data={[
                    { value: "editor", label: "Editor" },
                    { value: "viewer", label: "Viewer" },
                  ]}
                />
                <Button
                  type="submit"
                  loading={busy}
                  leftSection={<UserPlus size={14} />}
                >
                  Invite
                </Button>
              </Group>
              {error !== undefined && (
                <Alert color="red" variant="light" py={6}>
                  {error}
                </Alert>
              )}
            </Stack>
          </form>
        )}

        <Stack gap="xs">
          {members.map(member => {
            const self = member.uid === user?.uid;
            const owner = member.uid === space.ownerId;
            return (
              <Group key={member.uid} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Avatar
                    src={member.photoURL}
                    size="sm"
                    radius="xl"
                    color="indigo"
                  >
                    {member.displayName.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <div style={{ minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {member.displayName}
                      {self ? " (you)" : ""}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {member.email}
                    </Text>
                  </div>
                </Group>

                <Group gap="xs" wrap="nowrap">
                  {owner ? (
                    <Badge variant="light" color="indigo">
                      Owner
                    </Badge>
                  ) : isOwner ? (
                    <>
                      <Select
                        size="xs"
                        w={96}
                        value={member.role}
                        onChange={value => {
                          if (value === "editor" || value === "viewer") {
                            void updateMemberRole(space.id, member.uid, value);
                          }
                        }}
                        data={[
                          { value: "editor", label: "Editor" },
                          { value: "viewer", label: "Viewer" },
                        ]}
                      />
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label={`Remove ${member.displayName}`}
                        onClick={() => void removeMember(space.id, member.uid)}
                      >
                        <Trash2 size={14} />
                      </ActionIcon>
                    </>
                  ) : (
                    <Badge variant="light" color="gray">
                      {member.role}
                    </Badge>
                  )}
                </Group>
              </Group>
            );
          })}
        </Stack>
      </Stack>
    </Modal>
  );
}
