import { Accessor, Component, Signal, createRenderEffect } from "solid-js";
import style from "./style.module.scss";
import { nodeDefinition } from "../../types";
import { Logicflow } from "../../class";
import { BaseEdgeModel, BaseNodeModel } from "@logicflow/core";
import { allNodes } from "../../nodes";
import { Form } from "@/components/Form";
import { General } from "./common/general";

interface processFormProp {
  lf: Logicflow;
}
let processForm: Component<processFormProp> = (props) => {
  return <General lf={props.lf}></General>;
};
let getTargetByType: (type: string) => nodeDefinition | undefined = (
  type: string,
) => allNodes[type];
interface RightPanelProp {
  /**当前选中的节点或线 */
  currentNodeOrEdge?: BaseEdgeModel | BaseNodeModel;
  lf: Logicflow;
}
export let RightPanel: Component<RightPanelProp> = (props) => {
  let getContent = () => {
    if (props.currentNodeOrEdge) {
      let target = getTargetByType(props.currentNodeOrEdge.type);

      if (target) {
        if (target.modelRender) {
          return target.modelRender({
            lf: props.lf,
            currentModel: props.currentNodeOrEdge,
          });
        }
        return "该节点无属性面板";
      }
    }
    return processForm({
      lf: props.lf,
    });
  };
  return (
    <div
      class={style.rightPanel}
      style={{ border: "1px solid" }}>
      <Form
        labelSuffix="："
        labelPosition="top">
        {getContent()}
      </Form>
    </div>
  );
};
