import type { BoardSpec } from "./guideTypes";

const START = { tags: ["guide/start"] };
const TOGETHER = { tags: ["guide/together"] };

export const basicsBoard: BoardSpec = {
  name: "Basics",
  columns: [
    {
      name: "Cards",
      accent: "indigo",
      cards: [
        {
          title: "Open me",
          props: START,
          body: "Click this card to open it. `Esc` closes it again.",
        },
        {
          title: "Edit me",
          props: START,
          body: "Point at this card and press `e`. Type something, then press `Esc`.",
        },
        {
          title: "Resize me",
          props: START,
          height: 30,
          body: "Drag my bottom edge down.",
        },
        {
          title: "Add a card",
          props: START,
          body: "Use *Add card* at the bottom of a column and type a title.",
        },
      ],
    },
    {
      name: "Columns and boards",
      accent: "amber",
      cards: [
        {
          title: "Add a column",
          props: START,
          body: "Use *Add column* at the right end of the board.",
        },
        {
          title: "Add a board",
          props: TOGETHER,
          body: "Press **+** next to *Boards* in the sidebar.",
        },
        {
          title: "Reorder the boards",
          props: TOGETHER,
          body: "Drag a board in the sidebar to change its order.",
        },
        {
          title: "Clean up",
          props: TOGETHER,
          height: 55,
          body: "Done with the tour? Delete a board from the **⋯** next to its name in the sidebar.",
        },
      ],
    },
    {
      name: "People",
      accent: "rose",
      cards: [
        {
          title: "Invite someone",
          props: TOGETHER,
          height: 75,
          body: "Open *Members* in the sidebar and invite a friend by email. They need an Aven account first.",
        },
        {
          title: "Who can do what",
          props: TOGETHER,
          height: 75,
          body: "**Owners** manage people. **Editors** change boards and cards. **Viewers** can only read.",
        },
      ],
    },
  ],
};
