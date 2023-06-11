import { Component, JSX, createEffect, createSignal } from "solid-js";
import style from "./style.module.scss";
import { nodeDefinition, renderParams } from "../../types";
import { Logicflow } from "../../class";
import { BaseEdgeModel, BaseNodeModel } from "@logicflow/core";
import { allNodes } from "../../nodes";
import { Form, FormItem } from "@/components/Form";

interface processFormProp {
  lf: Logicflow;
}
let processForm: Component<processFormProp> = (props) => {
  let lf = props.lf;
  let [value, setValue] = createSignal("aaa");
  createEffect(() => {
    console.log(value());
  });
  return [
    <FormItem label="名称">
      <input
        value={value()}
        onInput={(e) => {
          setValue(e.target.value);
        }}></input>
    </FormItem>,
  ];
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
  let content;
  let [render, setRender] = createSignal<(obj: renderParams) => JSX.Element>(
    () => "",
  );
  createEffect(() => {
    if (props.currentNodeOrEdge) {
      let target = getTargetByType(props.currentNodeOrEdge.type);
      if (target) {
        if (target.modelRender) {
          let render = target.modelRender;
          setRender(() => render);
          return;
        }
      }
      setRender(() => () => "该节点无属性面板");
    } else {
      setRender(() => processForm);
    }
  });
  return (
    <div
      class={style.rightPanel}
      style={{ border: "1px solid" }}>
      <Form
        labelSuffix="："
        labelPosition="top">
        {render()
          ? render()({ currentModel: props.currentNodeOrEdge!, lf: props.lf })
          : ""}
      </Form>
    </div>
  );
};
