import { Form } from "@/components/Form";
import { Component, JSXElement, createSignal, useContext } from "solid-js";
import { LogicFlowContext } from "../..";
import { Logicflow } from "../../class";
import { allNodes } from "../../nodes";
import { nodeDefinition } from "../../types";
import { Documentation } from "./common/documentation";
import { ExtensionProperties } from "./common/extensionProperities";
import { General } from "./common/general";
import style from "./style.module.scss";

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
  let [pannelName, setPanelName] = createSignal<{
    name: () => string;
    icon: () => JSXElement;
  }>({ name: () => "全局属性", icon: () => "" });
  let getContent = () => {
    if (providerData.currentModel) {
      let target = getTargetByType(providerData.currentModel.type);
      if (target) {
        setPanelName({ name: target.name, icon: target.icon });
        let content = [];
        let modelRenderConfig = {
          ...defaultModelRenderConfig,
          ...(target.modelRenderConfig || {}),
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
          let form = providerData.lf.getForm(providerData.currentModel.id);
          content.push(
            target.modelRender({
              lf: providerData.lf,
              currentModel: providerData.currentModel,
              form,
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
    setPanelName({ name: () => "全局属性", icon: () => "" });
    return processForm({
      lf: providerData.lf,
    });
  };
  return (
    <div
      class={style.rightPanel}
      style={{ border: "1px solid" }}>
      <div class={style.topContent}>
        <span class={style.icon}>{pannelName().icon()}</span>
        <span class={style.name}>{pannelName().name()}</span>
      </div>
      <Form
        labelSuffix="："
        classList={{
          [style.form]: true,
        }}
        labelPosition="top">
        {getContent()}
      </Form>
    </div>
  );
};
