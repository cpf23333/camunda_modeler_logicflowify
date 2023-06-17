import { Component, createEffect } from "solid-js";
import { Collapse } from "../../collapse";
import { Logicflow } from "@/components/logicFlow/class";
import { FormItem } from "@/components/Form";
import { BaseEdgeModel, BaseNodeModel } from "@logicflow/core";

interface GeneralProp {
  lf: Logicflow;
  model?: BaseEdgeModel | BaseNodeModel;
}
export let General: Component<GeneralProp> = (props) => {
  let lf = props.lf;
  let [model, setModel] = props.lf.getForm<
    {},
    {},
    { isExecutable?: boolean },
    {}
  >(props.model ? props.model.id : props.lf.processId);

  if (props.model) {
    createEffect(() => {
      if (props.model) {
        if (props.model.text.value !== model.generalData.name) {
          props.model.updateText(model.generalData.name);
        }
        if (props.model.id !== model.generalData.id) {
          lf.mvForm(props.model.id, model.generalData.id);
          if (props.model instanceof BaseNodeModel) {
            lf.changeNodeId(props.model.id, model.generalData.id);
          } else if (props.model instanceof BaseEdgeModel) {
            lf.changeEdgeId(props.model.id, model.generalData.id);
          }
        }
      } else {
        if (props.lf.processId !== model.generalData.id) {
          props.lf.processId = model.generalData.id;
        }
      }
    });
  }
  return (
    <Collapse
      lf={props.lf}
      title="General"
      model={props.model}
      id="General">
      <FormItem label="名称">
        <input
          value={model.generalData.name}
          onInput={(e) => {
            setModel("generalData", "name", e.target.value);
          }}></input>
      </FormItem>
      <FormItem label="ID">
        <input
          value={model.generalData.id}
          onInput={(e) => {
            setModel("generalData", "id", e.target.value);
          }}></input>
      </FormItem>
    </Collapse>
  );
};
