import { Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

// Space with no tab selected; later this redirects to the first tab.
export const Route = createFileRoute("/s/$spaceId/")({
  component: SpaceIndexPage,
});

function SpaceIndexPage() {
  const { spaceId } = Route.useParams();
  return <Text>Space {spaceId}</Text>;
}
