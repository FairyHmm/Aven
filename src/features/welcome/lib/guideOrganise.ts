import { type BoardSpec, type GuideDates, md } from "./guideTypes";

export function organiseBoard(d: GuideDates): BoardSpec {
  return {
    name: "Organising",
    columns: [
      {
        name: "Properties",
        accent: "emerald",
        cards: [
          {
            title: "Add a label",
            props: { tags: ["guide/organise"] },
            body: "Point at this card and press `l`. Pick a colour, or give it a name.",
          },
          {
            title: "Set a due date",
            props: { tags: ["guide/organise"] },
            body: "Press `d` and pick a date. It turns red once it's overdue.",
          },
          {
            title: "Add a field of your own",
            props: { tags: ["guide/organise"] },
            height: 75,
            body: "Open this card and add a *Custom field* called `effort`. Give it a number and it becomes a number field.",
          },
          {
            title: "Peek at the properties",
            props: {
              tags: ["guide/organise"],
              start: d.today,
              due: `${d.inAWeek}T17:00`,
              reminder: "1 day before",
              effort: 2,
              reviewed: false,
            },
            height: 75,
            body: md(
              "This card already has dates, a reminder and two fields of its own. Open it to change them.",
            ),
          },
        ],
      },
      {
        name: "Find things",
        accent: "rose",
        cards: [
          {
            title: "Click a label strip",
            props: { tags: ["guide/organise", "green"] },
            height: 75,
            body: "Click the coloured strip above this title. Every label switches between colour and text.",
          },
          {
            title: "Filter the board",
            props: { tags: ["guide/organise"] },
            height: 75,
            body: "Click *Filter* in the toolbar and choose `guide`. Click it again to clear. Cards can't be dragged while a filter is on.",
          },
          {
            title: "Nest a label",
            props: { tags: ["guide/organise"] },
            height: 55,
            body: "Add a label named `guide/mine` to any card. Filtering by `guide` finds it as well.",
          },
        ],
      },
    ],
  };
}
