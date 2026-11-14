import {
  ActionIcon,
  Alert,
  Group,
  Image,
  Paper,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { Download, FileText, Trash2 } from "lucide-react";

import { formatBytes } from "../../lib/attachments";
import type { Attachment } from "../../lib/types";

import sections from "./cardSections.module.css";

type Props = {
  attachments: readonly Attachment[];
  progress: number | undefined;
  error: string | undefined;
  onClearError: () => void;
  onRemove: (attachment: Attachment) => void;
};

export function AttachmentsSection({
  attachments,
  progress,
  error,
  onClearError,
  onRemove,
}: Props) {
  if (
    attachments.length === 0 &&
    progress === undefined &&
    error === undefined
  ) {
    return null;
  }

  return (
    <section className={sections.section}>
      <h4 className={sections.sectionLabel}>Attachments</h4>
      <Stack gap="xs">
        {error !== undefined && (
          <Alert
            color="red"
            variant="light"
            py={6}
            withCloseButton
            onClose={onClearError}
          >
            {error}
          </Alert>
        )}

        {progress !== undefined && (
          <Progress value={progress} size="sm" animated />
        )}

        {attachments.map(item => {
          const isImage = item.contentType.startsWith("image/");
          return (
            <Paper key={item.id} withBorder p="xs" radius="sm">
              <Group justify="space-between" wrap="nowrap" gap="sm">
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                  {isImage ? (
                    <Image
                      src={item.url}
                      alt={item.name}
                      w={48}
                      h={36}
                      radius="xs"
                      fit="cover"
                    />
                  ) : (
                    <FileText size={20} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <Text size="xs" fw={500} truncate>
                      {item.name}
                    </Text>
                    <Text size="10px" c="dimmed">
                      {formatBytes(item.size)}
                    </Text>
                  </div>
                </Group>

                <Group gap={4} wrap="nowrap">
                  <ActionIcon
                    component="a"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    download={item.name}
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label={`Download ${item.name}`}
                  >
                    <Download size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => {
                      onRemove(item);
                    }}
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </section>
  );
}
