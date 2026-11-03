import { Text } from "@mantine/core";
import { useParams } from "@tanstack/react-router";

// Guest access via share link.
export function GuestLinkPage() {
  const { token } = useParams({ from: "/g/$token" });
  return <Text>Guest link: {token}</Text>;
}
