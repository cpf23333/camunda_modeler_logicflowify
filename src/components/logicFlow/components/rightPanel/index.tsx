import { Component } from "solid-js";
import style from "./style.module.scss";
import { nodeDefinition } from "../../types";
interface Props {
  /**当前选中的节点或线 */
  currentNodeOrEdge?: nodeDefinition;
}
export let RightPanel: Component<Props> = (props) => {
  return (
    <div
      class={style.rightPanel}
      style={{ border: "1px solid" }}>
      {props.currentNodeOrEdge?.name}
    </div>
  );
};
