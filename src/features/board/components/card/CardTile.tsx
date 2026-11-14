import { AlignLeft, Paperclip, Pencil, Workflow } from "lucide-react";
import { useRef } from "react";

import { MarkdownView } from "../../../editor/components/MarkdownView";
import { useBoardActions } from "../../hooks/useBoardActions";
import {
  useEditCard,
  useHoverCard,
  useIsEditing,
  useOpenCard,
} from "../../hooks/useCardEditor";
import { useClamped } from "../../hooks/useClamped";
import { useGrow } from "../../hooks/useGrow";
import { cardKind } from "../../lib/kind";
import { tracksProgress } from "../../lib/props/defaults";
import { ago } from "../../lib/time";
import type { Card } from "../../lib/types";
import { CardEditor } from "./CardEditor";
import { ProgressBadge } from "./ProgressBadge";
import { PropsRow } from "./PropsRow";

import classes from "./card.module.css";

// A click opens the card in the modal. The pencil (or `e` while the pointer
// is on the tile) turns the tile itself into the editor.
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
  const { editCard } = useBoardActions();
  const body = useRef<HTMLDivElement>(null);
  const clamped = useClamped(body);
  const tile = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useGrow(tile, inner, card.id);

  return (
    <div
      ref={tile}
      className={classes.card}
      role="button"
      tabIndex={0}
      data-card-id={card.id}
      onPointerEnter={() => {
        hover(card.id);
      }}
      onPointerLeave={() => {
        hover(undefined);
      }}
      onClick={() => {
        open(card.id);
      }}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(card.id);
        }
      }}
    >
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
      <div ref={inner} className={classes.inner}>
        <PropsRow
          props={card.props}
          onProps={next => {
            // Change the date from its chip via the calendar popup.
            editCard(card.id, {
              title: card.title,
              body: card.body,
              props: next,
            });
          }}
        />
        <span className={classes.title}>{card.title}</span>
        {card.body !== "" && (
          <div
            ref={body}
            className={classes.body}
            data-clamped={clamped ? "" : undefined}
          >
            <MarkdownView
              body={card.body}
              onBodyChange={next => {
                editCard(card.id, { title: card.title, body: next });
              }}
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
    </div>
  );
}
