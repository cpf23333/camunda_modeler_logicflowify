import { Component, For } from "solid-js";
import { nodeDefinition } from "../../types";
import { startEvent } from "../../nodes/event/startEvent";
import { endEvent } from "../../nodes/event/endEvent";
import { Logicflow } from "../../class";
import style from "./index.module.scss";
interface Props {
  lf: Logicflow;
}

export let LeftDndPanel: Component<Props> = (props) => {
  let nodes: Array<nodeDefinition> = [startEvent, endEvent];
  let startDrag = (node: nodeDefinition) => {
    let dnd = props.lf.dnd;
    dnd.startDrag({
      type: node.type,
      text: node.name,
    });
  };
  return (
    <ul class={style.nodes}>
      <For
        each={nodes}
        fallback={<div>渲染失败</div>}>
        {(item) => {
          return (
            <li
              class={style.nodeItem}
              onMouseDown={() => startDrag(item)}>
              <div innerHTML={item.icon}></div>
              {item.name}
            </li>
          );
        }}
      </For>
    </ul>
  );
};
