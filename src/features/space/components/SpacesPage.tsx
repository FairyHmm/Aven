import { Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import { spaces } from "../../../shared/lib/fixtures";

// Home / dashboard: list of accessible spaces.
export function SpacesPage() {
  return (
    <Stack gap="md">
      <Title order={2}>Spaces</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {spaces.map(space => (
          <Link
            key={space.id}
            to="/s/$spaceId"
            params={{ spaceId: space.id }}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Paper withBorder p="sm" radius="md" h="100%">
              <Group justify="space-between">
                <Text fw={600}>{space.name}</Text>
                <Text size="sm" c="dimmed">
                  {space.boards.length}{" "}
                  {space.boards.length === 1 ? "board" : "boards"}
                </Text>
              </Group>
            </Paper>
          </Link>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
