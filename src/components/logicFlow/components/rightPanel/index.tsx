import { Component, createSignal } from "solid-js";
import style from "./style.module.scss";
import { nodeDefinition } from "../../types";
import { Logicflow } from "../../class";
import { BaseEdgeModel, BaseNodeModel } from "@logicflow/core";
import { allNodes } from "../../nodes";
import { Form } from "@/components/Form";
import { General } from "./common/general";
import { Documentation } from "./common/documentation";

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
let defaultModelRenderConfig = {
  general: true,
  documation: true,
  extensionProperties: true,
};
export let RightPanel: Component<RightPanelProp> = (props) => {
  let [pannelName, setPanelName] = createSignal({ name: "全局属性", icon: "" });
  let getContent = () => {
    if (props.currentNodeOrEdge) {
      let target = getTargetByType(props.currentNodeOrEdge.type);
      if (target) {
        setPanelName({ name: target.name, icon: target.icon });
        let content = [];
        let modelRenderConfig = {
          ...defaultModelRenderConfig,
          ...(target.modelRenderCOnfig || {}),
        };
        if (modelRenderConfig.general) {
          content.push(
            <General
              model={props.currentNodeOrEdge}
              lf={props.lf}></General>,
          );
        }
        if (modelRenderConfig.documation) {
          content.push(
            <Documentation
              currentNodeOrEdge={props.currentNodeOrEdge}
              lf={props.lf}></Documentation>,
          );
        }
        if (target.modelRender) {
          content.push(
            target.modelRender({
              lf: props.lf,
              currentModel: props.currentNodeOrEdge,
            }),
          );
        }
        if (content.length) {
          return content;
        }
        return "该节点无属性面板";
      }
    }
    setPanelName({ name: "全局属性", icon: "" });
    return processForm({
      lf: props.lf,
    });
  };
  return (
    <div
      class={style.rightPanel}
      style={{ border: "1px solid" }}>
      <div class={style.topContent}>
        <span
          class={style.icon}
          innerHTML={pannelName().icon}></span>
        <span class={style.name}>{pannelName().name}</span>
      </div>
      <Form
        labelSuffix="："
        labelPosition="top">
        {getContent()}
      </Form>
    </div>
  );
};
