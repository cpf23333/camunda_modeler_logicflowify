import { Component, For, useContext } from "solid-js";
import { LogicFlowContext } from "../..";
import { EndEvent } from "../../nodes/event/endEvent";
import { StartEvent } from "../../nodes/event/startEvent";
import { subProcess } from "../../nodes/others/subprocess";
import { TaskEvent } from "../../nodes/task/task";
import { UserTask } from "../../nodes/task/userTask";
import { nodeDefinition } from "../../types";
import style from "./index.module.scss";
export let LeftDndPanel: Component = () => {
  let lfContext = useContext(LogicFlowContext);
  let providerData = lfContext.providerData;
  let nodes: Array<nodeDefinition<any, any, any, any, any>> = [
    StartEvent,
    EndEvent,
    TaskEvent,
    UserTask,
    subProcess,
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
