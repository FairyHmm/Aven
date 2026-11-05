import "@mantine/core/styles.css";
import "../styles/theme.css";
import "../styles/dnd.css";
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
