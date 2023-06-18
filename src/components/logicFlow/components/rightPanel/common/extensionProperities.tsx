import { For, useContext } from "solid-js";
import { Collapse } from "../../collapse";
import { LogicFlowContext } from "@/components/logicFlow";
import { Form, FormItem } from "@/components/Form";

export let ExtensionProperties = () => {
  let { providerData } = useContext(LogicFlowContext);
  if (providerData.currentModel?.id) {
    let [state, setState] = providerData.lf.getForm(
      providerData.currentModel.id,
    );
    return (
      <Collapse
        title="拓展属性"
        lf={providerData.lf}
        id="extensionProperties"
        model={providerData.currentModel}>
        <For each={state.extensionElements}>
          {(item, index) => {
            return (
              <Collapse
                title={item.name || ""}
                id={`extensionProperties-${index}`}
                lf={providerData.lf}
                model={providerData.currentModel}>
                <Form labelPosition="top">
                  <FormItem label="名称"></FormItem>
                  <FormItem label="值"></FormItem>
                </Form>
              </Collapse>
            );
          }}
        </For>
      </Collapse>
    );
  }
  return "";
};
