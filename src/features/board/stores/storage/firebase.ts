import type { DocumentData, WriteBatch } from "firebase/firestore";

import type { BoardRef, Card, Column } from "../../lib/types";
import { isAccent } from "../../lib/types";
import type { BoardStorage } from "./types";

// One Firestore document per column and per card, so concurrent edits to
// different cards never collide:
//   spaces/{spaceId}/boards/{boardId}/columns/{id}
//   spaces/{spaceId}/boards/{boardId}/cards/{id}
// The SDK (and the env-driven app init) is imported lazily, so local mode
// never loads Firebase or needs the .env values.

const BATCH_LIMIT = 400; // Firestore allows 500 writes per batch.

async function firestore() {
  const [{ firestore: db }, fs] = await Promise.all([
    import("../../../../shared/lib/firebase/app"),
    import("firebase/firestore"),
  ]);
  const collection = (ref: BoardRef, name: "columns" | "cards") =>
    fs.collection(db, "spaces", ref.spaceId, "boards", ref.boardId, name);
  return { db, fs, collection };
}

const text = (value: unknown, fallback: string): string =>
  typeof value === "string" ? value : fallback;
const num = (value: unknown, fallback: number): number =>
  typeof value === "number" ? value : fallback;

function toColumn(id: string, data: DocumentData): Column {
  return {
    id,
    name: text(data.name, "Untitled"),
    accent: isAccent(data.accent) ? data.accent : "indigo",
    order: text(data.order, "a0"),
  };
}

function toCard(id: string, data: DocumentData): Card {
  return {
    id,
    columnId: text(data.columnId, ""),
    title: text(data.title, "Untitled"),
    body: text(data.body, ""),
    order: text(data.order, "a0"),
    createdAt: num(data.createdAt, 0),
    updatedAt: num(data.updatedAt, 0),
  };
}

export const firebaseBoardStorage: BoardStorage = {
  load: async ref => {
    const { fs, collection } = await firestore();
    const [columns, cards] = await Promise.all([
      fs.getDocs(collection(ref, "columns")),
      fs.getDocs(collection(ref, "cards")),
    ]);
    if (columns.empty && cards.empty) {
      return undefined;
    }
    return {
      columns: columns.docs.map(item => toColumn(item.id, item.data())),
      cards: cards.docs.map(item => toCard(item.id, item.data())),
    };
  },

  apply: async (ref, patch) => {
    const { db, fs, collection } = await firestore();
    const columns = collection(ref, "columns");
    const cards = collection(ref, "cards");

    const writes: ((batch: WriteBatch) => void)[] = [
      ...patch.columns.map(column => (batch: WriteBatch) => {
        batch.set(fs.doc(columns, column.id), column);
      }),
      ...patch.cards.map(card => (batch: WriteBatch) => {
        batch.set(fs.doc(cards, card.id), card);
      }),
      ...patch.removeColumns.map(id => (batch: WriteBatch) => {
        batch.delete(fs.doc(columns, id));
      }),
      ...patch.removeCards.map(id => (batch: WriteBatch) => {
        batch.delete(fs.doc(cards, id));
      }),
    ];

    for (let start = 0; start < writes.length; start += BATCH_LIMIT) {
      const batch = fs.writeBatch(db);
      for (const write of writes.slice(start, start + BATCH_LIMIT)) {
        write(batch);
      }
      await batch.commit();
    }
  },
};
