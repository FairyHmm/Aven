import { newId } from "../../../../shared/lib/id";
import { byOrder } from "../../../../shared/lib/order";
import type { Board, Space } from "../../lib/types";
import {
  addSpaceMember,
  findUserByEmail,
  removeSpaceMember,
  spaceSdk,
  updateSpaceMemberRole,
} from "./firebaseMembers";
import { toBoard, toSpace } from "./parse";
import type { SpaceStorage } from "./types";

export const firebaseSpaceStorage: SpaceStorage = {
  subscribeSpaces: (uid, onData, onError) => {
    let active = true;
    let stop: (() => void) | undefined;
    void spaceSdk()
      .then(({ db, fs }) => {
        if (!active) return;
        const q = fs.query(
          fs.collection(db, "spaces"),
          fs.where("memberIds", "array-contains", uid),
        );
        stop = fs.onSnapshot(
          q,
          snap => {
            onData(
              snap.docs
                .map(d => toSpace(d.id, d.data()))
                .sort((a, b) => a.createdAt - b.createdAt),
            );
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
      stop?.();
    };
  },

  subscribeBoards: (spaceId, onData, onError) => {
    let active = true;
    let stop: (() => void) | undefined;
    void spaceSdk()
      .then(({ db, fs }) => {
        if (!active) return;
        stop = fs.onSnapshot(
          fs.collection(db, "spaces", spaceId, "boards"),
          snap => {
            onData(
              snap.docs
                .map(d => toBoard(spaceId, d.id, d.data()))
                .sort(byOrder),
            );
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
      stop?.();
    };
  },

  createSpace: async (name, owner) => {
    const { db, fs } = await spaceSdk();
    const now = Date.now();
    const id = newId();
    const space: Space = {
      id,
      name: name.trim() || "Untitled space",
      ownerId: owner.uid,
      memberIds: [owner.uid],
      members: { [owner.uid]: { ...owner, role: "owner", addedAt: now } },
      createdAt: now,
      updatedAt: now,
    };
    const boardId = newId();
    const batch = fs.writeBatch(db);
    batch.set(fs.doc(db, "spaces", id), space);
    batch.set(fs.doc(db, "spaces", id, "boards", boardId), {
      name: "Board 1",
      order: "a0",
      createdAt: now,
      updatedAt: now,
    });
    await batch.commit();
    return space;
  },

  renameSpace: async (spaceId, name) => {
    const { db, fs } = await spaceSdk();
    await fs.updateDoc(fs.doc(db, "spaces", spaceId), {
      name: name.trim() || "Untitled space",
      updatedAt: Date.now(),
    });
  },

  deleteSpace: async spaceId => {
    const { db, fs } = await spaceSdk();
    const boards = await fs.getDocs(
      fs.collection(db, "spaces", spaceId, "boards"),
    );
    const batch = fs.writeBatch(db);
    for (const b of boards.docs) batch.delete(b.ref);
    batch.delete(fs.doc(db, "spaces", spaceId));
    await batch.commit();
  },

  createBoard: async (spaceId, name, order) => {
    const { db, fs } = await spaceSdk();
    const now = Date.now();
    const id = newId();
    const board: Board = {
      id,
      spaceId,
      name: name.trim() || "Untitled board",
      order,
      createdAt: now,
      updatedAt: now,
    };
    await fs.setDoc(fs.doc(db, "spaces", spaceId, "boards", id), {
      name: board.name,
      order: board.order,
      createdAt: now,
      updatedAt: now,
    });
    return board;
  },

  renameBoard: async (spaceId, boardId, name) => {
    const { db, fs } = await spaceSdk();
    await fs.updateDoc(fs.doc(db, "spaces", spaceId, "boards", boardId), {
      name: name.trim() || "Untitled board",
      updatedAt: Date.now(),
    });
  },

  deleteBoard: async (spaceId, boardId) => {
    const { db, fs } = await spaceSdk();
    const [cols, cards] = await Promise.all([
      fs.getDocs(
        fs.collection(db, "spaces", spaceId, "boards", boardId, "columns"),
      ),
      fs.getDocs(
        fs.collection(db, "spaces", spaceId, "boards", boardId, "cards"),
      ),
    ]);
    const batch = fs.writeBatch(db);
    for (const d of cols.docs) batch.delete(d.ref);
    for (const d of cards.docs) batch.delete(d.ref);
    batch.delete(fs.doc(db, "spaces", spaceId, "boards", boardId));
    await batch.commit();
  },

  reorderBoard: async (spaceId, boardId, order) => {
    const { db, fs } = await spaceSdk();
    await fs.updateDoc(fs.doc(db, "spaces", spaceId, "boards", boardId), {
      order,
      updatedAt: Date.now(),
    });
  },

  findUserByEmail,
  addMember: addSpaceMember,
  updateMemberRole: updateSpaceMemberRole,
  removeMember: removeSpaceMember,

  saveSettings: async (spaceId, patch) => {
    const { db, fs } = await spaceSdk();
    await fs.updateDoc(fs.doc(db, "spaces", spaceId), {
      ...patch,
      updatedAt: Date.now(),
    });
  },
};
