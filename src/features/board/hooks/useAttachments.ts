import { useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import type { Attachment } from "../lib/types";
import { useBoardStore } from "../stores/boardStore";
import {
  deleteAttachmentFile,
  uploadAttachment,
} from "../stores/storage/attachments";

export function useAttachments(cardId: string) {
  const { user } = useAuth();
  const ref = useBoardStore(state => state.ref);
  const addAttachment = useBoardStore(state => state.actions.addAttachment);
  const removeAttachment = useBoardStore(
    state => state.actions.removeAttachment,
  );
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState<string>();

  const upload = async (files: FileList | File[]) => {
    if (ref === undefined || user === null) return;
    setError(undefined);
    for (const file of Array.from(files)) {
      setProgress(0);
      try {
        const uploaded = await uploadAttachment(
          ref,
          cardId,
          file,
          user.uid,
          setProgress,
        );
        addAttachment(cardId, uploaded);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setProgress(undefined);
      }
    }
  };

  const remove = async (attachment: Attachment) => {
    removeAttachment(cardId, attachment.id);
    try {
      await deleteAttachmentFile(attachment.storagePath);
    } catch {
      // Metadata already removed; storage cleanup is best-effort.
    }
  };

  return {
    upload,
    remove,
    progress,
    error,
    clearError: () => {
      setError(undefined);
    },
  };
}
