import { createTheme, type MantineColorsTuple } from "@mantine/core";

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

export const theme = createTheme({
  primaryColor: "indigo",
  colors: { dark: slate },
  components: {
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
