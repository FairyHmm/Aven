import { Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/g/$token")({
  component: GuestLinkPage,
});

function GuestLinkPage() {
  const { token } = Route.useParams();
  return <Text>Guest link: {token}</Text>;
}
