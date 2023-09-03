import { Form, FormItem } from "@/components/Form";
import { For, JSX } from "solid-js";
import { produce } from "solid-js/store";
import { Forms } from "../class";
import { CollapseItem } from "../components/CollapseItem";
import { Collapse } from "../components/collapse";
import { EqualInput } from "../components/equalInput";
import { Input } from "../components/input";
import { initParams, renderParams } from "../types";
interface IOifyModel {
  inputs: {
    /**本地变量名 */
    target: string;
    /**变量值 */
    source: string;
  }[];
  outputs: {
    /**本地变量名 */
    target: string;
    /**变量值 */
    source: string;
  }[];
  headers: { key: string; value: string }[];
}
interface ioConf {
  initModel: (params: initParams) => Partial<Forms<any, any, any, any>>;
  modelRender: (params: renderParams<any, any, any, any>) => JSX.Element;
}
export let IOify = (conf: {
  /**是否同时存在header相关功能 */
  widthHeader: boolean;
}) => {
  let def: ioConf = {
    initModel() {
      return {
        baseModel: { inputs: [], outputs: [], headers: [] },
      };
    },
    modelRender(params: any) {
      let { form, currentModel, lf } = params as renderParams<IOifyModel>;
      let [model, setModel] = form;
      return [
        <Collapse
          onAdd={() => {
            setModel(
              produce((old) => {
                return old.baseModel.inputs.push({
                  target: "",
                  source: "",
                });
              }),
            );
          }}
          title="输入"
          id="input">
          <Form labelPosition="top">
            <For each={model.baseModel.inputs}>
              {(item, index) => {
                return (
                  <CollapseItem
                    title={item.target}
                    onDelete={() => {
                      setModel(
                        produce((old) => {
                          old.baseModel.inputs.splice(index(), 1);
                        }),
                      );
                    }}
                    lf={lf}
                    id={`${currentModel.id}-input-${index()}`}>
                    <FormItem label={"本地变量名"}>
                      <Input
                        model={[
                          () => item.target,
                          (val) => {
                            setModel(
                              "baseModel",
                              "inputs",
                              index(),
                              "target",
                              val,
                            );
                          },
                        ]}></Input>
                    </FormItem>
                    <EqualInput
                      forceEqual
                      label="变量值"
                      model={[
                        () => item.source,
                        (val) => {
                          setModel(
                            "baseModel",
                            "inputs",
                            index(),
                            "source",
                            val,
                          );
                        },
                      ]}></EqualInput>
                  </CollapseItem>
                );
              }}
            </For>
          </Form>
        </Collapse>,
        <Collapse
          title="输出"
          onAdd={() => {
            setModel(
              produce((old) => {
                old.baseModel.outputs.push({
                  target: "",
                  source: "",
                });
              }),
            );
          }}
          id="output">
          <Form labelPosition="top">
            <For each={model.baseModel.outputs}>
              {(item, index) => {
                return (
                  <CollapseItem
                    title={item.target}
                    onDelete={() => {
                      setModel(
                        produce((old) => {
                          old.baseModel.outputs.splice(index(), 1);
                        }),
                      );
                    }}
                    lf={lf}
                    id={`${currentModel.id}-input-${index()}`}>
                    <FormItem label={"本地变量名"}>
                      <Input
                        model={[
                          () => item.target,
                          (val) => {
                            setModel(
                              "baseModel",
                              "outputs",
                              index(),
                              "target",
                              val,
                            );
                          },
                        ]}></Input>
                    </FormItem>

                    <EqualInput
                      forceEqual
                      label="变量值"
                      model={[
                        () => item.source,
                        (val) => {
                          setModel(
                            "baseModel",
                            "outputs",
                            index(),
                            "source",
                            val,
                          );
                        },
                      ]}></EqualInput>
                  </CollapseItem>
                );
              }}
            </For>
          </Form>
        </Collapse>,
        conf.widthHeader ? (
          <Collapse
            id={"headers"}
            title="headers">
            <For each={model.baseModel.headers}>
              {(item, index) => {
                return (
                  <>
                    <FormItem label={"键"}>
                      <input
                        onInput={(e) => {
                          setModel(
                            "baseModel",
                            "headers",
                            index(),
                            "key",
                            e.target.value,
                          );
                        }}
                        value={item.key}></input>
                    </FormItem>
                    <FormItem label={"值"}>
                      <input
                        onInput={(e) => {
                          setModel(
                            "baseModel",
                            "headers",
                            index(),
                            "value",
                            e.target.value,
                          );
                        }}
                        value={item.value}></input>
                    </FormItem>
                  </>
                );
              }}
            </For>
          </Collapse>
        ) : (
          ""
        ),
      ];
    },
  };
  return def;
};
