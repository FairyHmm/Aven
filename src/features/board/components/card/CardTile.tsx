import { AlignLeft, Paperclip, Pencil, Workflow } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

import { ResizeHandle } from "../../../../shared/components/ResizeHandle";
import { useLiveSize } from "../../../../shared/hooks/useLiveSize";
import { MarkdownView } from "../../../editor/components/MarkdownView";
import { useBoardActions } from "../../hooks/useBoardActions";
import { useCanEdit } from "../../hooks/useCanEdit";
import {
  useAnyEditing,
  useEditCard,
  useHoverCard,
  useIsEditing,
  useOpenCard,
} from "../../hooks/useCardEditor";
import { useClamped } from "../../hooks/useClamped";
import { useContextEdit } from "../../hooks/useContextEdit";
import { useGrow } from "../../hooks/useGrow";
import { cardKind } from "../../lib/kind";
import { tracksProgress } from "../../lib/props/defaults";
import { ago } from "../../lib/time";
import { BODY_HEIGHT, type Card } from "../../lib/types";
import { CardEditor } from "./CardEditor";
import { ProgressBadge } from "./ProgressBadge";
import { PropsRow } from "./PropsRow";

import classes from "./card.module.css";

// A click opens the card in the modal. The pencil, `e` while the pointer is on
// the tile, or a right-click (a long press on a phone) turns the tile itself
// into the editor.
export function CardTile({ card }: { card: Card }) {
  return useIsEditing(card.id) ? (
    <EditingTile card={card} />
  ) : (
    <ReadingTile card={card} />
  );
}

// While editing, text selection owns the pointer: the card cannot be dragged
// until the edit ends (see CardSlot).
function EditingTile({ card }: { card: Card }) {
  const tile = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useGrow(tile, inner, card.id);
  return (
    <div ref={tile} className={classes.card} data-editing="">
      <div ref={inner} className={classes.inner}>
        <CardEditor card={card} />
      </div>
    </div>
  );
}

function ReadingTile({ card }: { card: Card }) {
  const open = useOpenCard();
  const edit = useEditCard();
  const hover = useHoverCard();
  const contextEdit = useContextEdit(card.id);
  const { editCard, resizeCard } = useBoardActions();
  const canEdit = useCanEdit();
  // Another card is being edited and the board is dimmed: nothing to resize.
  const dimmed = useAnyEditing();
  const body = useRef<HTMLDivElement>(null);
  // How much of the text the tile shows: dragged from its bottom edge.
  const { live, size: shown, bind } = useLiveSize(card.height);
  const clamped = useClamped(body);
  const tile = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useGrow(tile, inner, card.id);
  // The column scrolls, so while the edge is dragged it is kept in view: the
  // end of a tall card is never somewhere off screen.
  useLayoutEffect(() => {
    if (live !== undefined) {
      tile.current
        ?.querySelector<HTMLElement>('[role="separator"]')
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [live]);

  return (
    <div
      ref={tile}
      className={classes.card}
      role="button"
      tabIndex={0}
      data-card-id={card.id}
      data-resizing={live === undefined ? undefined : ""}
      onPointerEnter={() => {
        hover(card.id);
      }}
      onPointerLeave={() => {
        hover(undefined);
      }}
      onClick={() => {
        open(card.id);
      }}
      onContextMenu={contextEdit}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(card.id);
        }
      }}
    >
      {canEdit && (
        <button
          type="button"
          className={classes.quickEdit}
          aria-label="Edit card"
          onClick={event => {
            event.stopPropagation();
            edit(card.id);
          }}
        >
          <Pencil size={13} />
        </button>
      )}
      <div ref={inner} className={classes.inner}>
        <PropsRow
          props={card.props}
          onProps={
            canEdit
              ? next => {
                  // Change the date from its chip via the calendar popup.
                  editCard(card.id, {
                    title: card.title,
                    body: card.body,
                    props: next,
                  });
                }
              : undefined
          }
        />
        <span className={classes.title}>{card.title}</span>
        {(card.body !== "" || shown !== undefined) && (
          <div
            ref={body}
            className={classes.body}
            style={
              shown === undefined
                ? undefined
                : { height: shown, maxHeight: "none" }
            }
            data-clamped={clamped ? "" : undefined}
          >
            <MarkdownView
              body={card.body}
              onBodyChange={
                canEdit
                  ? next => {
                      editCard(card.id, { title: card.title, body: next });
                    }
                  : undefined
              }
            />
          </div>
        )}
        <div className={classes.meta}>
          {cardKind(card.body) === "diagram" ? (
            <Workflow size={12} aria-label="Diagram" />
          ) : (
            card.body !== "" && <AlignLeft size={12} aria-label="Has notes" />
          )}
          {tracksProgress(card.props) && <ProgressBadge body={card.body} />}
          {(card.attachments?.length ?? 0) > 0 && (
            <span aria-label={`${card.attachments?.length} attachments`}>
              <Paperclip size={12} /> {card.attachments?.length}
            </span>
          )}
          <span>{ago(card.updatedAt)}</span>
        </div>
      </div>
      {canEdit && !dimmed && (
        <ResizeHandle
          axis="y"
          label="Resize card"
          value={shown ?? BODY_HEIGHT.initial}
          min={BODY_HEIGHT.min}
          max={BODY_HEIGHT.max}
          size={() => body.current?.offsetHeight ?? 0}
          {...bind(
            next => {
              resizeCard(card.id, next);
            },
            () => {
              // Clamped: show all of it. Showing more than the default: back.
              resizeCard(
                card.id,
                clamped ? body.current?.scrollHeight : undefined,
              );
            },
          )}
        />
      )}
    </div>
  );
}
