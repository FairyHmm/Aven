import { newId } from "../../../../shared/lib/id";
import { STORAGE_MODE } from "../../../../shared/lib/storageMode";
import type { Attachment, BoardRef } from "../../lib/types";

const MAX_LOCAL_BYTES = 2 * 1024 * 1024;
const MAX_REMOTE_BYTES = 10 * 1024 * 1024;

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read file."));
      }
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Could not read file."));
    };
    reader.readAsDataURL(file);
  });
}

async function storageSdk() {
  const [{ firebaseStorage }, st] = await Promise.all([
    import("../../../../shared/lib/firebase/app"),
    import("firebase/storage"),
  ]);
  return { firebaseStorage, st };
}

export async function uploadAttachment(
  ref: BoardRef,
  cardId: string,
  file: File,
  uploadedBy: string,
  onProgress?: (percent: number) => void,
): Promise<Attachment> {
  const id = newId();
  const safeName = file.name.replace(/[/\\]/g, "_");
  const contentType = file.type || "application/octet-stream";

  if (STORAGE_MODE === "local") {
    if (file.size > MAX_LOCAL_BYTES) {
      throw new Error("Local mode supports attachments up to 2 MB.");
    }
    onProgress?.(40);
    const url = await readDataUrl(file);
    onProgress?.(100);
    return {
      id,
      name: safeName,
      size: file.size,
      contentType,
      url,
      storagePath: "",
      uploadedBy,
      uploadedAt: Date.now(),
    };
  }

  if (file.size > MAX_REMOTE_BYTES) {
    throw new Error("Attachments must be smaller than 10 MB.");
  }

  const { firebaseStorage, st } = await storageSdk();
  const storagePath = `spaces/${ref.spaceId}/boards/${ref.boardId}/cards/${cardId}/${id}-${safeName}`;
  const fileRef = st.ref(firebaseStorage, storagePath);
  const task = st.uploadBytesResumable(fileRef, file, { contentType });

  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      snap => {
        if (snap.totalBytes > 0) {
          onProgress?.(
            Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
          );
        }
      },
      reject,
      () => {
        resolve();
      },
    );
  });

  const url = await st.getDownloadURL(task.snapshot.ref);
  return {
    id,
    name: safeName,
    size: file.size,
    contentType,
    url,
    storagePath,
    uploadedBy,
    uploadedAt: Date.now(),
  };
}

export async function deleteAttachmentFile(storagePath: string): Promise<void> {
  if (STORAGE_MODE === "local" || storagePath === "") {
    return;
  }
  const { firebaseStorage, st } = await storageSdk();
  await st.deleteObject(st.ref(firebaseStorage, storagePath));
}
