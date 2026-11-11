import { TextInput } from "@mantine/core";
import { useState } from "react";

import { useViewSwitch } from "../../hooks/useViewSwitch";
import { colorOf, freshColor } from "../../lib/labels/tags";
import { ViewFade } from "../ViewFade";
import { EditLabel } from "./LabelForms";
import { PopupHeader } from "./PopupHeader";
import { TagList } from "./TagList";
import { type Picker, type View } from "./tagPickerTypes";

import classes from "./pickers.module.css";

// Picker for labels or dropdown options: select, create, edit, and recolour names.
export function TagPicker(props: Picker) {
  const switcher = useViewSwitch<View>({ kind: "list" });
  // Preserve the query when switching views.
  const [query, setQuery] = useState("");
  return (
    <ViewFade switcher={switcher} morph exit={110}>
      <TagPickerView
        {...props}
        view={switcher.view}
        go={switcher.go}
        query={query}
        setQuery={setQuery}
      />
    </ViewFade>
  );
}

type Inner = {
  view: View;
  go: (view: View) => void;
  query: string;
  setQuery: (query: string) => void;
};

function TagPickerView(props: Picker & Inner) {
  const { kind, colors, selected, known, onChange, close } = props;
  const { view, go: setView, query, setQuery } = props;
  const list = () => {
    setView({ kind: "list" });
  };

  const toggle = (tag: string) => {
    if (kind.single) {
      onChange(selected.includes(tag) ? [] : [tag]);
      close();
      return;
    }
    onChange(
      selected.includes(tag)
        ? selected.filter(item => item !== tag)
        : [...selected, tag],
    );
  };

  if (view.kind === "edit") {
    const { tag: from } = view;
    const { onRemove } = props;
    return (
      <EditLabel
        kind={kind}
        colors={colors}
        tag={from}
        onBack={list}
        onClose={close}
        onSave={(tag, color) => {
          props.onSave(from, tag, color);
          list();
        }}
        onRemove={
          onRemove === undefined
            ? undefined
            : () => {
                onRemove(from);
                list();
              }
        }
      />
    );
  }

  const wanted = kind.normalize(query);
  const match = known.find(tag => tag.toLowerCase() === wanted.toLowerCase());
  const shown = known.filter(tag =>
    tag.toLowerCase().includes(wanted.toLowerCase()),
  );
  const isNew = wanted !== "" && match === undefined;
  // A new name is made as it is typed, in a colour no other name has; the colour
  // (and the rest) is changed afterwards, with the pencil.
  const create = () => {
    props.onCreate(
      wanted,
      wanted.includes("/")
        ? colorOf(wanted, colors)
        : freshColor(known, colors),
    );
    setQuery("");
    onChange(kind.single ? [wanted] : [...new Set([...selected, wanted])]);
    if (kind.single) {
      close();
    }
  };

  return (
    <div className={classes.picker}>
      <PopupHeader title={props.title ?? kind.title} onClose={close} />
      <TextInput
        size="sm"
        data-autofocus
        placeholder={`Find or make ${/^[aeiou]/.test(kind.noun) ? "an" : "a"} ${kind.noun}…`}
        aria-label={`Find or make ${/^[aeiou]/.test(kind.noun) ? "an" : "a"} ${kind.noun}`}
        value={query}
        onChange={event => {
          setQuery(event.currentTarget.value);
        }}
        onKeyDown={event => {
          if (event.key !== "Enter" || wanted === "") {
            return;
          }
          event.preventDefault();
          if (isNew) {
            create();
          } else if (match !== undefined) {
            toggle(match);
          }
        }}
      />
      <TagList
        kind={kind}
        colors={colors}
        known={known}
        shown={shown}
        selected={selected}
        listId={props.title ?? kind.title}
        newName={isNew ? wanted : undefined}
        onToggle={toggle}
        onEdit={tag => {
          setView({ kind: "edit", tag });
        }}
        onRemove={props.onRemove}
        onMove={props.onMove}
        onCreate={create}
      />
      {props.footer}
    </div>
  );
}
