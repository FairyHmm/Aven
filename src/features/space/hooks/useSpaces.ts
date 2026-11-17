import { useEffect, useMemo } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import type { Space, SpaceMember } from "../lib/types";
import { useSpaceStore } from "../stores/spaceStore";

export type { Board, Space, SpaceMember, SpaceRole } from "../lib/types";

const EMPTY_BOARDS: never[] = [];

export function useSpaces() {
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    useSpaceStore.getState().watchSpaces(uid);
  }, [uid]);

  const spaces = useSpaceStore(state => state.spaces);
  const status = useSpaceStore(state => state.spacesStatus);
  const error = useSpaceStore(state => state.error);
  return { spaces, status, error };
}

export function useSpace(spaceId: string | undefined): {
  space: Space | undefined;
  loading: boolean;
} {
  const { spaces, status } = useSpaces();
  const space = useMemo(
    () =>
      spaceId === undefined ? undefined : spaces.find(s => s.id === spaceId),
    [spaces, spaceId],
  );
  return { space, loading: status !== "ready" };
}

export function useBoards(spaceId: string) {
  useEffect(() => {
    const store = useSpaceStore.getState();
    store.watchBoards(spaceId);
    return () => {
      store.unwatchBoards(spaceId);
    };
  }, [spaceId]);

  const boards = useSpaceStore(
    state => state.boardsBySpace[spaceId] ?? EMPTY_BOARDS,
  );
  const status = useSpaceStore(
    state => state.boardsStatus[spaceId] ?? "loading",
  );
  return { boards, loading: status !== "ready" };
}

export function useSpaceMembers(spaceId: string | undefined): SpaceMember[] {
  const { space } = useSpace(spaceId);
  return useMemo(() => {
    if (space === undefined) return [];
    return Object.values(space.members).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
  }, [space]);
}

export function useSpaceActions() {
  const { user } = useAuth();
  const renameSpace = useSpaceStore(s => s.renameSpace);
  const deleteSpace = useSpaceStore(s => s.deleteSpace);
  const createBoard = useSpaceStore(s => s.createBoard);
  const renameBoard = useSpaceStore(s => s.renameBoard);
  const deleteBoard = useSpaceStore(s => s.deleteBoard);
  const moveBoard = useSpaceStore(s => s.moveBoard);
  const inviteMember = useSpaceStore(s => s.inviteMember);
  const updateMemberRole = useSpaceStore(s => s.updateMemberRole);
  const removeMember = useSpaceStore(s => s.removeMember);
  const dismissError = useSpaceStore(s => s.dismissError);

  return {
    createSpace: (name: string) =>
      user === null
        ? Promise.resolve(undefined)
        : useSpaceStore.getState().createSpace(name, {
            uid: user.uid,
            email: user.email ?? "",
            displayName: user.displayName ?? "User",
            photoURL: user.photoURL,
          }),
    renameSpace,
    deleteSpace,
    createBoard,
    renameBoard,
    deleteBoard,
    moveBoard,
    inviteMember,
    updateMemberRole,
    removeMember,
    dismissError,
  };
}
