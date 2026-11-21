import { type BoardSpec, md } from "./guideTypes";

const TAGS = { tags: ["guide/write"] };

// Live examples: press `e` on a card to see and change the markdown behind it.
export const writeBoard: BoardSpec = {
  name: "Writing",
  columns: [
    {
      name: "Text",
      accent: "sky",
      cards: [
        {
          title: "Style a sentence",
          props: TAGS,
          height: 105,
          body: md(
            "Press `e`, select a word, then try `Ctrl/⌘ + B`, `I`, `Shift + X` and `Shift + H`.",
            "",
            "Aven cards are written in markdown.",
          ),
        },
        {
          title: "Finish the list",
          props: { ...TAGS, progress: true },
          height: 125,
          body: md(
            "- [x] A ticked box stays visible",
            "- [ ] Point here and right-click the box that appears",
            "- [ ] Press `e` and add a task of your own, starting with `- [ ]`",
          ),
        },
        {
          title: "Add a callout",
          props: TAGS,
          height: 110,
          body: md(
            "Press `e`, right-click, and choose Insert, then Callout.",
            "",
            "> [!tip]- Like this one",
            "> Click the title to fold it.",
          ),
        },
      ],
    },
    {
      name: "Show",
      accent: "violet",
      cards: [
        {
          title: "Build a table",
          props: TAGS,
          height: 195,
          body: md(
            "Press `e`, then type `^` in a cell to merge it with the one above, or `<` to merge it with the one on its left.",
            "",
            "| Team | Task | Status |",
            "|---|---|---|",
            "| Design | Mockups | Done |",
            "| ^ | Icons | In progress |",
            "| Build | Board | < |",
          ),
        },
        {
          title: "Swap the image",
          props: TAGS,
          height: 285,
          body: md(
            "Replace the address with another image from the web. Or open the card and use *Attach* to upload one.",
            "",
            "![A kanban board](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Simple-kanban-board-.jpg/500px-Simple-kanban-board-.jpg)",
            "",
            "*Image: Jeff Lasovski, CC BY-SA 3.0, via Wikimedia Commons.*",
          ),
        },
      ],
    },
    {
      name: "Draw",
      accent: "emerald",
      cards: [
        {
          title: "Edit the code and maths",
          props: TAGS,
          height: 140,
          body: md(
            "Change the language after the backticks, or a number in the formula.",
            "",
            "```ts",
            "const total = (xs: number[]) => xs.reduce((a, b) => a + b, 0);",
            "```",
            "",
            "$e^{i\\pi} + 1 = 0$",
          ),
        },
        {
          title: "Redraw the diagram",
          props: TAGS,
          height: 320,
          body: md(
            "Press `e` and add a line such as `Card --> Shipped`.",
            "",
            "```mermaid",
            "flowchart LR",
            "  Idea --> Card",
            "  Card --> Done",
            "```",
          ),
        },
      ],
    },
  ],
};
