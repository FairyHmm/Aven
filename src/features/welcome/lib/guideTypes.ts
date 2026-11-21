import type { Accent, Card } from "../../board/hooks/saveBoardContent";

export type CardSpec = {
  title: string;
  body: string;
  props?: Card["props"];
  // Px of body the tile shows; unset = the default.
  height?: number;
};
export type ColumnSpec = { name: string; accent: Accent; cards: CardSpec[] };
export type BoardSpec = { name: string; columns: ColumnSpec[] };

// Dates the sample cards use, relative to when the guide is made.
export type GuideDates = {
  today: string;
  inThreeDays: string;
  inAWeek: string;
};

export const md = (...lines: string[]) => lines.join("\n");
