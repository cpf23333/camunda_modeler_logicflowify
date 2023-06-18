import { Component, createSignal, useContext } from "solid-js";
import style from "./style.module.scss";
import { nodeDefinition } from "../../types";
import { Logicflow } from "../../class";
import { BaseEdgeModel, BaseNodeModel } from "@logicflow/core";
import { allNodes } from "../../nodes";
import { Form } from "@/components/Form";
import { General } from "./common/general";
import { Documentation } from "./common/documentation";
import { LogicFlowContext } from "../..";
import { ExtensionProperties } from "./common/extensionProperities";

interface processFormProp {
  lf: Logicflow;
}
let processForm: Component<processFormProp> = (props) => {
  return <General lf={props.lf}></General>;
};
let getTargetByType: (type: string) => nodeDefinition | undefined = (
  type: string,
) => allNodes[type];

let defaultModelRenderConfig = {
  general: true,
  documation: true,
  extensionProperties: true,
};
export let RightPanel: Component = () => {
  let lfContext = useContext(LogicFlowContext);
  let { providerData } = lfContext;
  let [pannelName, setPanelName] = createSignal({ name: "全局属性", icon: "" });
  let getContent = () => {
    if (providerData.currentModel) {
      let target = getTargetByType(providerData.currentModel.type);
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
              model={providerData.currentModel}
              lf={providerData.lf}></General>,
          );
        }
        if (modelRenderConfig.documation) {
          content.push(
            <Documentation
              currentNodeOrEdge={providerData.currentModel}
              lf={providerData.lf}></Documentation>,
          );
        }
        if (target.modelRender) {
          content.push(
            target.modelRender({
              lf: providerData.lf,
              currentModel: providerData.currentModel,
            }),
          );
        }
        if (modelRenderConfig.extensionProperties) {
          content.push(<ExtensionProperties></ExtensionProperties>);
        }
        if (content.length) {
          return content;
        }
        return "该节点无属性面板";
      }
    }
    setPanelName({ name: "全局属性", icon: "" });
    return processForm({
      lf: providerData.lf,
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
