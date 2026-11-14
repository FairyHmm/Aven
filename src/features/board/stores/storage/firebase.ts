import type { DocumentData, WriteBatch } from "firebase/firestore";

import { toProps } from "../../lib/props/props";
import type { Attachment, BoardRef, Card, Column } from "../../lib/types";
import { isAccent } from "../../lib/types";
import type { BoardStorage } from "./types";

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

const isUnknownArray = (value: unknown): value is readonly unknown[] =>
  Array.isArray(value);

function toAttachments(raw: unknown): Attachment[] | undefined {
  if (!isUnknownArray(raw) || raw.length === 0) return undefined;
  const out: Attachment[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const rec = Object.fromEntries(Object.entries(item));
    if (typeof rec.id !== "string" || typeof rec.url !== "string") continue;
    out.push({
      id: rec.id,
      name: text(rec.name, "file"),
      size: num(rec.size, 0),
      contentType: text(rec.contentType, "application/octet-stream"),
      url: rec.url,
      storagePath: text(rec.storagePath, ""),
      uploadedBy: text(rec.uploadedBy, ""),
      uploadedAt: num(rec.uploadedAt, 0),
    });
  }
  return out.length > 0 ? out : undefined;
}

function toColumn(id: string, data: DocumentData): Column {
  return {
    id,
    name: text(data.name, "Untitled"),
    accent: isAccent(data.accent) ? data.accent : "indigo",
    order: text(data.order, "a0"),
  };
}

function toCard(id: string, data: DocumentData): Card {
  const attachments = toAttachments(data.attachments);
  return {
    id,
    columnId: text(data.columnId, ""),
    title: text(data.title, "Untitled"),
    props: toProps(data.props),
    body: text(data.body, ""),
    order: text(data.order, "a0"),
    ...(attachments !== undefined ? { attachments } : {}),
    createdAt: num(data.createdAt, 0),
    updatedAt: num(data.updatedAt, 0),
  };
}

function serializeCard(card: Card): Record<string, unknown> {
  const { attachments, ...rest } = card;
  return attachments !== undefined && attachments.length > 0
    ? { ...rest, attachments }
    : rest;
}

export const firebaseBoardStorage: BoardStorage = {
  load: async ref => {
    const { fs, collection } = await firestore();
    const [columns, cards] = await Promise.all([
      fs.getDocs(collection(ref, "columns")),
      fs.getDocs(collection(ref, "cards")),
    ]);
    if (columns.empty && cards.empty) return undefined;
    return {
      columns: columns.docs.map(item => toColumn(item.id, item.data())),
      cards: cards.docs.map(item => toCard(item.id, item.data())),
    };
  },

  subscribe: (ref, { onData, onError }) => {
    let active = true;
    let stopCols: (() => void) | undefined;
    let stopCards: (() => void) | undefined;
    let columns: Column[] | undefined;
    let cards: Card[] | undefined;
    let colsFromCache = true;
    let cardsFromCache = true;

    const emit = () => {
      if (columns !== undefined && cards !== undefined) {
        onData({ columns, cards }, colsFromCache || cardsFromCache);
      }
    };

    void firestore()
      .then(({ fs, collection }) => {
        if (!active) return;
        stopCols = fs.onSnapshot(
          collection(ref, "columns"),
          snap => {
            columns = snap.docs.map(item => toColumn(item.id, item.data()));
            colsFromCache = snap.metadata.fromCache;
            emit();
          },
          onError,
        );
        stopCards = fs.onSnapshot(
          collection(ref, "cards"),
          snap => {
            cards = snap.docs.map(item => toCard(item.id, item.data()));
            cardsFromCache = snap.metadata.fromCache;
            emit();
          },
          onError,
        );
      })
      .catch((error: unknown) => {
        if (active) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      });

    return () => {
      active = false;
      stopCols?.();
      stopCards?.();
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
        batch.set(fs.doc(cards, card.id), serializeCard(card));
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
