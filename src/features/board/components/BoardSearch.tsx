import { CloseButton, TextInput } from "@mantine/core";
import { Search } from "lucide-react";

import { useFilterStore } from "../stores/filterStore";

import classes from "./boardSearch.module.css";

// Narrows the board to the cards whose title, notes or labels contain what is
// typed. `/` jumps here; Esc clears it and leaves.
export function BoardSearch() {
  const text = useFilterStore(state => state.text);
  const setText = useFilterStore(state => state.setText);
  return (
    <TextInput
      className={classes.search}
      size="sm"
      radius="md"
      placeholder="Search cards   /"
      data-filled={text !== ""}
      aria-label="Search the cards on this board"
      data-board-search
      leftSection={<Search size={13} />}
      rightSection={
        text === "" ? null : (
          <CloseButton
            size="sm"
            aria-label="Clear the search"
            onClick={() => {
              setText("");
            }}
          />
        )
      }
      value={text}
      onChange={event => {
        setText(event.currentTarget.value);
      }}
      onKeyDown={event => {
        if (event.key === "Escape") {
          setText("");
          event.currentTarget.blur();
        }
      }}
    />
  );
}
