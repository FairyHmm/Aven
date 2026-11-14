import { insertionIndex } from "../../../shared/lib/dnd/reorder";
import { byOrder, keyAtIndex } from "../../../shared/lib/order";
import type { Board, Space, SpaceMember, SpaceRole } from "../lib/types";
import { spaceStorage } from "./storage";

let stopSpaces: (() => void) | undefined;
const stopBoards = new Map<string, () => void>();
const boardCounts = new Map<string, number>();

export const errMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

export function watchUserSpaces(
  uid: string | undefined,
  onSpaces: (spaces: Space[]) => void,
  onError: (msg: string) => void,
): boolean {
  if (uid === undefined) {
    stopSpaces?.();
    stopSpaces = undefined;
    return false;
  }
  stopSpaces?.();
  stopSpaces = spaceStorage.subscribeSpaces(uid, onSpaces, error => {
    onError(errMessage(error));
  });
  return true;
}

export function clearSpaceSubscriptions(): void {
  stopSpaces?.();
  stopSpaces = undefined;
  for (const stop of stopBoards.values()) stop();
  stopBoards.clear();
  boardCounts.clear();
}

export function watchSpaceBoards(
  spaceId: string,
  onBoards: (boards: Board[]) => void,
  onError: (msg: string) => void,
): boolean {
  const refs = (boardCounts.get(spaceId) ?? 0) + 1;
  boardCounts.set(spaceId, refs);
  if (stopBoards.has(spaceId)) return false;

  const unsub = spaceStorage.subscribeBoards(
    spaceId,
    boards => {
      onBoards([...boards].sort(byOrder));
    },
    error => {
      onError(errMessage(error));
    },
  );
  stopBoards.set(spaceId, unsub);
  return true;
}

export function unwatchSpaceBoards(spaceId: string): void {
  const refs = (boardCounts.get(spaceId) ?? 1) - 1;
  if (refs > 0) {
    boardCounts.set(spaceId, refs);
    return;
  }
  boardCounts.delete(spaceId);
  stopBoards.get(spaceId)?.();
  stopBoards.delete(spaceId);
}

export function reorderBoardList(
  boards: Board[],
  boardId: string,
  index: number,
): { boards: Board[]; order: string } | undefined {
  const current = boards.find(b => b.id === boardId);
  if (current === undefined) return undefined;
  const at = insertionIndex(
    boards.map(b => b.id),
    boardId,
    index,
  );
  if (boards.indexOf(current) === at) return undefined;
  const others = boards.filter(b => b.id !== boardId);
  const order = keyAtIndex(others, at);
  return {
    order,
    boards: [
      ...others.slice(0, at),
      { ...current, order },
      ...others.slice(at),
    ],
  };
}

export async function inviteSpaceMember(
  spaceId: string,
  email: string,
  role: SpaceRole,
): Promise<string | undefined> {
  try {
    const found = await spaceStorage.findUserByEmail(email);
    if (found === undefined) {
      return "No registered account found with that email.";
    }
    const member: SpaceMember = { ...found, role, addedAt: Date.now() };
    await spaceStorage.addMember(spaceId, member);
    return undefined;
  } catch (error: unknown) {
    return errMessage(error);
  }
}
