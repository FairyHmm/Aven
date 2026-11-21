import { Skeleton } from "@mantine/core";
import { type ComponentProps, lazy, Suspense } from "react";

import type { FieldControl as Loaded } from "./FieldControl";

const loadControl = () => import("./FieldControl");
const Control = lazy(() =>
  loadControl().then(module => ({ default: module.FieldControl })),
);

// The input of a custom field (number, date and so on), loaded with the card
// back that shows it; date and number inputs are a sizeable part of the app.
export function FieldControl(props: ComponentProps<typeof Loaded>) {
  return (
    <Suspense fallback={<Skeleton h={36} radius="sm" />}>
      <Control {...props} />
    </Suspense>
  );
}
