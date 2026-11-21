import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { saveBoardContent } from "../../board/hooks/saveBoardContent";
import { useSpaceActions, useSpaces } from "../../space/hooks/useSpaces";
import { GUIDE, guideBoards } from "../lib/guide";

// Gives a brand-new account (or a first trial) a "Welcome" space of small
// boards to try things on, then opens the first. Renders nothing.
export function WelcomeGate() {
  const { user, welcomeUid, clearWelcome } = useAuth();
  const { spaces, status } = useSpaces();
  const { createSpace } = useSpaceActions();
  const navigate = useNavigate();
  const busy = useRef(false);

  useEffect(() => {
    if (user === null || welcomeUid !== user.uid || status !== "ready") {
      return;
    }
    if (busy.current) {
      return;
    }
    clearWelcome();
    if (spaces.length > 0) {
      return;
    }
    busy.current = true;
    void (async () => {
      try {
        const boards = guideBoards();
        const space = await createSpace(
          GUIDE.spaceName,
          boards.map(({ id, name }) => ({ id, name })),
        );
        if (space === undefined) {
          return;
        }
        // Written before a board is first opened, so the default starter
        // cards never get seeded in its place.
        await Promise.all(
          boards.map(board =>
            saveBoardContent(
              { spaceId: space.id, boardId: board.id },
              board.data,
            ),
          ),
        );
        const first = boards[0];
        if (first !== undefined) {
          await navigate({
            to: "/s/$spaceId/$boardId",
            params: { spaceId: space.id, boardId: first.id },
          });
        }
      } finally {
        busy.current = false;
      }
    })();
  }, [
    user,
    welcomeUid,
    status,
    spaces.length,
    clearWelcome,
    createSpace,
    navigate,
  ]);

  return null;
}
