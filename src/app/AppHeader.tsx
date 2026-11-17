import {
  Avatar,
  Group,
  Menu,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { House, LogOut } from "lucide-react";

import { useAuth } from "../features/auth/hooks/useAuth";
import { useSpace } from "../features/space/hooks/useSpaces";

// App chrome: home icon plus the current space, and the signed-in user menu.
export function AppHeader() {
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const match = matchRoute({ to: "/s/$spaceId", fuzzy: true });
  const { space } = useSpace(match === false ? undefined : match.spaceId);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/login", replace: true });
  };

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        {/* Placeholder icon until the real mark exists. */}
        <Link to="/" aria-label="Home">
          <ThemeIcon variant="light" size="lg" radius="md">
            <House size={18} />
          </ThemeIcon>
        </Link>

        <Text fw={700}>{space === undefined ? "Aven" : space.name}</Text>
      </Group>

      {user !== null && (
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <UnstyledButton aria-label="Account menu">
              <Group gap="xs" wrap="nowrap">
                <Avatar
                  src={user.photoURL}
                  size="sm"
                  radius="xl"
                  color="indigo"
                >
                  {(user.displayName ?? user.email ?? "U")
                    .slice(0, 2)
                    .toUpperCase()}
                </Avatar>
                <Text size="sm" fw={500} visibleFrom="xs">
                  {user.displayName ?? user.email}
                </Text>
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            {user.email !== null && <Menu.Label>{user.email}</Menu.Label>}
            <Menu.Item
              color="red"
              leftSection={<LogOut size={14} />}
              onClick={() => void handleSignOut()}
            >
              Sign out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  );
}
