import {
  createTheme,
  type MantineColorsTuple,
  Popover,
  type PopoverProps,
} from "@mantine/core";

// Slate ramp from theme.css, arranged for Mantine's dark-surface slots:
// 4 = borders, 5 = hover, 6 = default surface, 7 = page background.
const slate: MantineColorsTuple = [
  "var(--color-text)", // 0
  "var(--color-text-muted)", // 1
  "var(--color-text-subtle)", // 2
  "var(--color-ac)", // 3
  "var(--color-border)", // 4
  "var(--color-bg-hover)", // 5
  "var(--color-bg-card)", // 6
  "var(--color-bg)", // 7
  "var(--color-bg-deep)", // 8
  "var(--color-bg-deep)", // 9
];

const MARGIN = 8;

// A popup must stay on screen. It opens on the side of its button with more
// room, slides along the edge rather than sticking out, and when it is still
// too tall it floats up over its own button (so it needs no scrollbar). Only
// when it is taller than the whole window does it scroll inside itself.
const onScreen: PopoverProps["middlewares"] = {
  flip: { padding: MARGIN },
  shift: { padding: MARGIN, crossAxis: true },
  size: {
    padding: MARGIN,
    apply({ elements }) {
      const room = document.documentElement.clientHeight - 2 * MARGIN;
      elements.floating.style.maxHeight = `${room}px`;
      elements.floating.style.overflowY = "auto";
    },
  },
};

export const theme = createTheme({
  primaryColor: "indigo",
  colors: { dark: slate },
  components: {
    Popover: Popover.extend({
      defaultProps: { shadow: "md", middlewares: onScreen },
    }),
    AppShell: {
      styles: {
        header: {
          backgroundColor: "var(--color-bg-deep)",
          borderBottom: "1px solid var(--color-border)",
        },
      },
    },
  },
});
