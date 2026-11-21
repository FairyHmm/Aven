import { Center, Loader } from "@mantine/core";
import { type ComponentProps, lazy, Suspense } from "react";

import type { DatesPicker as Loaded } from "./DatesPicker";

const loadPicker = () => import("./DatesPicker");
const Picker = lazy(() =>
  loadPicker().then(module => ({ default: module.DatesPicker })),
);

// The date picker, loaded when a date popup first opens (the calendar
// components are a sizeable part of the app).
export function DatesPicker(props: ComponentProps<typeof Loaded>) {
  return (
    <Suspense
      fallback={
        <Center mih={240} miw={260}>
          <Loader size="sm" />
        </Center>
      }
    >
      <Picker {...props} />
    </Suspense>
  );
}
