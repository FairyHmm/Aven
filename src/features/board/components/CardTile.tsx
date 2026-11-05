import { AlignLeft } from "lucide-react";

import { useOpenCard } from "../hooks/useCardEditor";
import { snippet } from "../lib/snippet";
import { ago } from "../lib/time";
import type { Card } from "../lib/types";

import classes from "./card.module.css";

export function CardTile({ card }: { card: Card }) {
  const open = useOpenCard();
  const preview = snippet(card.body);

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
      {preview !== "" && <p className={classes.snippet}>{preview}</p>}
      <div className={classes.meta}>
        {card.body !== "" && <AlignLeft size={12} aria-label="Has notes" />}
        <span>{ago(card.updatedAt)}</span>
      </div>
    </div>
  );
}
