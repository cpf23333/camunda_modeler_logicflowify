import { Component } from "solid-js";
import { Logicflow } from "../../class";
import { BaseEdgeModel, BaseNodeModel } from "@logicflow/core";
interface CollapseProp {
  /**标题 */
  title: string;
  children?: any;
  /**本面板在本节点内的的id */
  id: string;
  lf: Logicflow;
  /**当前选中的节点或线，不传入的话视为在编辑全局属性 */
  model?: BaseNodeModel | BaseEdgeModel;
}
export let Collapse: Component<CollapseProp> = (props) => {
  let [state, setState] = props.lf.getForm<{}, {}>(
    props.model ? props.model.id : props.lf.processId,
  );
  return (
    <div>
      <div class="title">
        <span>{props.title}</span>
      </div>
      {props.children ? <div class="content">{props.children}</div> : ""}
    </div>
  );
};
