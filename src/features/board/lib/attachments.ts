import { patchOf } from "./patch";
import type { Attachment, BoardData, BoardPatch } from "./types";

export function addAttachment(
  data: BoardData,
  cardId: string,
  attachment: Attachment,
  now = Date.now(),
): BoardPatch {
  const card = data.cards.find(item => item.id === cardId);
  if (card === undefined) {
    return patchOf();
  }
  const current = card.attachments ?? [];
  return patchOf({
    cards: [
      {
        ...card,
        attachments: [...current, attachment],
        updatedAt: now,
      },
    ],
  });
}

export function removeAttachment(
  data: BoardData,
  cardId: string,
  attachmentId: string,
  now = Date.now(),
): BoardPatch {
  const card = data.cards.find(item => item.id === cardId);
  if (card === undefined) {
    return patchOf();
  }
  const next = (card.attachments ?? []).filter(
    item => item.id !== attachmentId,
  );
  const { attachments: _, ...without } = card;
  return patchOf({
    cards: [
      next.length > 0
        ? { ...without, attachments: next, updatedAt: now }
        : { ...without, updatedAt: now },
    ],
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
