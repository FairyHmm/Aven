import { AlignLeft, Workflow } from "lucide-react";
import { useRef } from "react";

import { MarkdownView } from "../../editor/components/MarkdownView";
import { useBoardActions } from "../hooks/useBoardActions";
import { useOpenCard } from "../hooks/useCardEditor";
import { useClamped } from "../hooks/useClamped";
import { cardKind } from "../lib/kind";
import { ago } from "../lib/time";
import type { Card } from "../lib/types";

import classes from "./card.module.css";

export function CardTile({ card }: { card: Card }) {
  const open = useOpenCard();
  const { editCard } = useBoardActions();
  const body = useRef<HTMLDivElement>(null);
  const clamped = useClamped(body);

  return (
    <div
      className={classes.card}
      role="button"
      tabIndex={0}
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
        <span>{ago(card.updatedAt)}</span>
      </div>
    </div>
  );
}
