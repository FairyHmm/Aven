import {
  Avatar,
  Group,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { Check } from "lucide-react";
import { useState } from "react";

import { useSpaceMembers } from "../../../space/hooks/useSpaces";
import { useBoardStore } from "../../stores/boardStore";
import { PopupHeader } from "./PopupHeader";

import classes from "./pickers.module.css";

type Props = {
  selected: string[];
  onChange: (members: string[]) => void;
  close: () => void;
};

export function MembersPicker({ selected, onChange, close }: Props) {
  const spaceId = useBoardStore(state => state.ref?.spaceId);
  const members = useSpaceMembers(spaceId);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered =
    q === ""
      ? members
      : members.filter(
          m =>
            m.displayName.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q),
        );

  const toggle = (uid: string) => {
    const next = selected.includes(uid)
      ? selected.filter(id => id !== uid)
      : [...selected, uid];
    onChange(next);
  };

  return (
    <div className={classes.picker}>
      <PopupHeader title="Members" onClose={close} />
      <TextInput
        size="xs"
        placeholder="Search members…"
        autoFocus
        value={query}
        onChange={event => {
          setQuery(event.currentTarget.value);
        }}
      />
      {filtered.length === 0 ? (
        <p className={classes.note}>
          {members.length === 0
            ? "No members in this space yet."
            : "No matching members."}
        </p>
      ) : (
        <Stack gap={4}>
          {filtered.map(member => {
            const active = selected.includes(member.uid);
            return (
              <UnstyledButton
                key={member.uid}
                onClick={() => {
                  toggle(member.uid);
                }}
                style={{
                  padding: "6px 8px",
                  borderRadius: 6,
                  background: active
                    ? "var(--mantine-color-default-hover)"
                    : "transparent",
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Avatar
                      src={member.photoURL}
                      size="xs"
                      radius="xl"
                      color="indigo"
                    >
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                      <Text size="xs" fw={500} truncate>
                        {member.displayName}
                      </Text>
                      <Text size="10px" c="dimmed" truncate>
                        {member.email}
                      </Text>
                    </div>
                  </Group>
                  {active && <Check size={14} />}
                </Group>
              </UnstyledButton>
            );
          })}
        </Stack>
      )}
    </div>
  );
}
