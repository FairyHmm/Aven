import { Alert, Stack } from "@mantine/core";
import { TriangleAlert } from "lucide-react";
import { useRef } from "react";

import { useAutoScroll } from "../../../shared/hooks/useAutoScroll";
import { useSortableDrop } from "../../../shared/hooks/useSortableDrop";
import { useSortableList } from "../../../shared/hooks/useSortableList";
import { useBoard } from "../hooks/useBoard";
import { useBoardActions } from "../hooks/useBoardActions";
import { AddColumn } from "./AddColumn";
import { BoardToolbar } from "./BoardToolbar";
import { CardEditorModal } from "./CardEditorModal";
import { ColumnView } from "./ColumnView";

import classes from "./board.module.css";

type Props = { spaceId: string; boardId: string; name: string };

export function BoardView({ spaceId, boardId, name }: Props) {
  const board = useBoard(spaceId, boardId);
  const actions = useBoardActions();
  const stage = useRef<HTMLDivElement>(null);
  const lane = useRef<HTMLDivElement>(null);
  useAutoScroll(stage);
  useSortableList(lane, {
    kind: "column",
    listId: "lane",
    axis: "horizontal",
    gap: 12,
    count: board.columns.length,
  });
  useSortableDrop("card", move => {
    actions.moveCard(move.id, move.toListId, move.index);
  });
  useSortableDrop("column", move => {
    actions.moveColumn(move.id, move.index);
  });

  return (
    <Stack gap="md">
      <BoardToolbar
        name={name}
        columnCount={board.columns.length}
        cardCount={board.cardCount}
        saving={board.saving}
      />

      {board.error !== undefined && (
        <Alert
          color="red"
          variant="light"
          radius="md"
          title="Storage problem"
          icon={<TriangleAlert size={18} />}
          withCloseButton
          onClose={actions.dismissError}
        >
          {board.error}
        </Alert>
      )}

      <div ref={stage} className={classes.stage}>
        <div
          ref={lane}
          className={classes.lane}
          aria-busy={board.status === "loading"}
        >
          {board.status === "loading" ? (
            <>
              <div className={classes.skeleton} />
              <div className={classes.skeleton} />
              <div className={classes.skeleton} />
            </>
          ) : (
            <>
              {board.columns.map((column, index) => (
                <ColumnView
                  key={column.id}
                  column={column}
                  index={index}
                  count={board.columns.length}
                />
              ))}
              <AddColumn />
            </>
          )}
        </div>
      </div>

      <CardEditorModal />
    </Stack>
  );
}
