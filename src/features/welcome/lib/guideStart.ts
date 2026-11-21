import { type BoardSpec } from "./guideTypes";

// Like Trello's welcome board: a handful of cards you can finish in a minute,
// so the first thing you see is small. The rest of the tour is in the other
// boards.
export const startBoard: BoardSpec = {
  name: "Start here",
  columns: [
    {
      name: "To try",
      accent: "indigo",
      cards: [
        {
          title: "Welcome",
          props: { tags: ["guide/start"] },
          height: 105,
          body: "Aven keeps work on boards of columns and cards. Try the cards here, and drag finished ones to **Done**. More boards are in the sidebar.",
        },
        {
          title: "Drag me to Done",
          props: { tags: ["guide/start"] },
          body: "Grab this card and drop it in the Done column.",
        },
        {
          title: "Tick the box",
          props: { tags: ["guide/start"], progress: true },
          body: "- [ ] Point at this line, then click the box that appears",
        },
      ],
    },
    {
      name: "Done",
      accent: "emerald",
      cards: [
        {
          title: "Open Aven",
          props: { tags: ["guide/start"] },
          body: "Nothing left to do here. Finished cards go in this column.",
        },
      ],
    },
  ],
};
