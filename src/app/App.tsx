import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "../styles/theme.css";
import "../styles/light.css";
import "../styles/dnd.css";
import "../styles/code.css";
import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "@tanstack/react-router";

import { theme } from "../styles/theme";
import { router } from "./router";

export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
