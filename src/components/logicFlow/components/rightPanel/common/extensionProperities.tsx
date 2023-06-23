import { For, useContext } from "solid-js";
import { Collapse } from "../../collapse";
import { LogicFlowContext } from "@/components/logicFlow";
import { Form, FormItem } from "@/components/Form";
import { produce } from "solid-js/store";
import { Item } from "../../Item";

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
        onAdd={() => {
          setState(
            produce((store) => {
              store.extensionElements.push({
                name: "",
                value: "",
              });
            }),
          );
        }}
        model={providerData.currentModel}>
        <For each={state.extensionElements}>
          {(item, index) => {
            return (
              <Item
                onDelete={() => {
                  setState(
                    produce((store) => {
                      store.extensionElements.splice(index(), 1);
                    }),
                  );
                }}
                title={item.name || ""}
                id={`extensionProperties-${index()}`}
                lf={providerData.lf}
                model={providerData.currentModel}>
                <Form labelPosition="top">
                  <FormItem label="名称">
                    <input
                      value={item.name}
                      onChange={(e) => {
                        setState(
                          produce((store) => {
                            store.extensionElements[index()].name =
                              e.target.value;
                          }),
                        );
                      }}></input>
                  </FormItem>
                  <FormItem label="值">
                    <input
                      value={item.value}
                      onChange={(e) => {
                        setState(
                          produce((store) => {
                            store.extensionElements[index()].value =
                              e.target.value;
                          }),
                        );
                      }}></input>
                  </FormItem>
                </Form>
              </Item>
            );
          }}
        </For>
      </Collapse>
    );
  }
  return "";
};
