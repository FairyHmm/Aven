import {
  ArrowRight,
  Check,
  Copy,
  PanelTop,
  SquareCheck,
  Trash2,
} from "lucide-react";

import { tracksProgress, withProgress } from "../../lib/props/defaults";
import type { Card, Props } from "../../lib/types";
import { useBoardStore } from "../../stores/boardStore";
import { useEditorStore } from "../../stores/editorStore";
import { ActionButton } from "../actions/ActionButton";
import { PropPopover } from "../cardBack/PropPopover";
import { POPUPS } from "./quickPopups";

// The quick-edit menu's first view: the card's actions, and the popups that
// edit its properties.
export function QuickMainView({
  card,
  props,
  onProps,
  finish,
  onMove,
}: {
  card: Card;
  props: Props;
  onProps: (props: Props) => void;
  // Save what was typed, then close the editor.
  finish: () => void;
  // Show the columns the card can move to.
  onMove: () => void;
}) {
  const popup = useEditorStore(state => state.popup);
  const setPopup = useEditorStore(state => state.setPopup);
  const open = useEditorStore(state => state.open);
  const { duplicateCard, removeCard } = useBoardStore(state => state.actions);
  return (
    <>
      <ActionButton
        filled
        icon={<Check size={15} />}
        label="Save"
        hint="Esc"
        onClick={finish}
      />
      <ActionButton
        icon={<PanelTop size={15} />}
        label="Open card"
        onClick={() => {
          finish();
          open(card.id);
        }}
      />
      {POPUPS.map(item => (
        <PropPopover
          key={item.kind}
          kind={item.kind}
          opened={popup === item.kind}
          onOpened={next => {
            setPopup(next ? item.kind : undefined);
          }}
          props={props}
          onChange={onProps}
          position="right-start"
        >
          <div>
            <ActionButton
              icon={item.icon}
              label={item.label}
              hint={item.hint}
              onClick={() => {
                setPopup(popup === item.kind ? undefined : item.kind);
              }}
            />
          </div>
        </PropPopover>
      ))}
      <ActionButton
        icon={<SquareCheck size={15} />}
        label={tracksProgress(props) ? "Hide progress" : "Show progress"}
        onClick={() => {
          onProps(withProgress(props, !tracksProgress(props)));
        }}
      />
      <ActionButton
        icon={<ArrowRight size={15} />}
        label="Move"
        onClick={() => {
          onMove();
        }}
      />
      <ActionButton
        icon={<Copy size={15} />}
        label="Copy card"
        onClick={() => {
          finish();
          duplicateCard(card.id);
        }}
      />
      <ActionButton
        icon={<Trash2 size={15} />}
        label="Delete"
        danger
        onClick={() => {
          removeCard(card.id);
          useEditorStore.getState().close();
        }}
      />
    </>
  );
}
