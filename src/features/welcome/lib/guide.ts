import { generateNKeysBetween } from "fractional-indexing";

import { newId } from "../../../shared/lib/id";
import type {
  BoardData,
  Card,
  Column,
} from "../../board/hooks/saveBoardContent";
import { basicsBoard } from "./guideBasics";
import { organiseBoard } from "./guideOrganise";
import { startBoard } from "./guideStart";
import type { BoardSpec, GuideDates } from "./guideTypes";
import { writeBoard } from "./guideWrite";

export const GUIDE = { spaceName: "Welcome" } as const;

const pad = (n: number) => String(n).padStart(2, "0");
const day = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function datesFrom(now: number): GuideDates {
  const plus = (days: number) => day(new Date(now + days * 86_400_000));
  return { today: plus(0), inThreeDays: plus(3), inAWeek: plus(7) };
}

function build(spec: BoardSpec, now: number): BoardData {
  const columnKeys = generateNKeysBetween(null, null, spec.columns.length);
  const columns: Column[] = [];
  const cards: Card[] = [];
  spec.columns.forEach((columnSpec, index) => {
    const column: Column = {
      id: newId(),
      name: columnSpec.name,
      accent: columnSpec.accent,
      order: columnKeys[index] ?? "a0",
    };
    columns.push(column);
    const cardKeys = generateNKeysBetween(null, null, columnSpec.cards.length);
    columnSpec.cards.forEach((card, cardIndex) => {
      cards.push({
        id: newId(),
        columnId: column.id,
        title: card.title,
        props: card.props ?? {},
        body: card.body,
        ...(card.height === undefined ? {} : { height: card.height }),
        order: cardKeys[cardIndex] ?? "a0",
        createdAt: now,
        updatedAt: now,
      });
    });
  });
  return { columns, cards };
}

export type GuideBoard = { id: string; name: string; data: BoardData };

// The tour for a brand-new account: small boards of things to try, the first
// (very short) one being where the account lands.
export function guideBoards(now = Date.now()): GuideBoard[] {
  const specs = [
    startBoard,
    basicsBoard,
    writeBoard,
    organiseBoard(datesFrom(now)),
  ];
  return specs.map(spec => ({
    id: newId(),
    name: spec.name,
    data: build(spec, now),
  }));
}
