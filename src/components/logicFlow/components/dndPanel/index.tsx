import { Component, For, JSX, useContext } from "solid-js";
import { nodeDefinition } from "../../types";
import { StartEvent } from "../../nodes/event/startEvent";
import { EndEvent } from "../../nodes/event/endEvent";
import style from "./index.module.scss";
import { LogicFlowContext } from "../..";
import { TaskEvent } from "../../nodes/task/task";
import { UserTask } from "../../nodes/task/userTask";

export let LeftDndPanel: Component = () => {
  let lfContext = useContext(LogicFlowContext);
  let providerData = lfContext.providerData;
  let nodes: Array<nodeDefinition> = [
    StartEvent,
    EndEvent,
    TaskEvent,
    UserTask,
  ];
  let startDrag = (node: nodeDefinition) => {
    let dnd = providerData.lf.dnd;
    dnd.startDrag({
      type: node.type,
      text: node.name(),
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
              <div>{item.icon({ size: 36 })}</div>
              {item.name()}
            </li>
          );
        }}
      </For>
    </ul>
  );
};
