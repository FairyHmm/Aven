import classes from "./board.module.css";

type Props = {
  name: string;
  columnCount: number;
  cardCount: number;
  saving: boolean;
};

export function BoardToolbar({ name, columnCount, cardCount, saving }: Props) {
  return (
    <div className={classes.toolbar}>
      <h2 className={classes.title}>{name}</h2>
      <p className={classes.meta}>
        {columnCount} columns · {cardCount} cards
        {saving ? " · Saving…" : ""}
      </p>
    </div>
  );
}
