import { Component } from "solid-js";
import { Logicflow } from "../../class";
import { BaseEdgeModel, BaseNodeModel } from "@logicflow/core";
interface CollapseProp {
  title: string;
  content: any;
  /**本面板在本节点内的的id */
  id: string;
  lf: Logicflow;
  /**当前选中的节点或线，不传入的话视为在编辑全局属性 */
  current?: BaseNodeModel | BaseEdgeModel;
}
export let Collapse: Component<CollapseProp> = (props) => {
  let state = props.lf.getForm(props.id).collapseData;
  return (
    <div>
      <div class="title">
        <span>{props.title}</span>
      </div>
    </div>
  );
};
