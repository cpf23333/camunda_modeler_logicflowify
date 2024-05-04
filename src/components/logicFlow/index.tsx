import { downloadTxt, readFile } from "@/utils/file";
import "@logicflow/core/dist/style/index.css";
import { Group, InsertNodeInPolyline } from "@logicflow/extension";
import "@logicflow/extension/lib/style/index.css";
import {
  Component,
  Show,
  createContext,
  createSignal,
  mergeProps,
  onMount,
} from "solid-js";
import { createStore } from "solid-js/store";
import { useFileDialog } from "solidjs-use";
import { Logicflow } from "./class";
import { LeftDndPanel } from "./components/dndPanel";
import { RightPanel } from "./components/rightPanel";
import style from "./index.module.scss";
import { allNodes } from "./nodes";
import { sequenceFlow } from "./nodes/edges/sequenceFlow";
import { Adapter } from "./plugins/Adapter";
import { ContextPad } from "./plugins/contextPad";
import "./style/index.scss";
import { BaseModel } from "./types";

let contextStore = createStore<{ lf: Logicflow; currentModel?: BaseModel }>({
  lf: undefined as unknown as Logicflow,
  currentModel: undefined,
});
export let LogicFlowContext = createContext({
  providerData: contextStore[0],
  setProviderData: contextStore[1],
});
interface Props {
  /**当前状态是编辑还是查看
   * @type {"edit"|"view"}
   */
  state: "edit" | "view";
  /**如果需要获取lf实例的话，传入这个 */
  lf?: (lf: Logicflow) => void;
  /**xml */
  value?: string;
}
export let Flow: Component<Props> = (props) => {
  props = mergeProps({ state: "edit" } as Props, props);
  let [providerData, setProviderData] = contextStore;
  let dom: HTMLDivElement | undefined = undefined;
  let [shouldShowRightPanel, setShouldShowRightPanel] =
    createSignal<boolean>(false);
  let updateLf = () => {
    if (props.state === "edit") {
    }

    let newLf = new Logicflow({
      container: dom!,
      nodeTextEdit: false,
      edgeTextEdit: false,
      grid: {
        type: "dot",
        size: 20,
      },
      plugins: [ContextPad, Adapter, Group, InsertNodeInPolyline],
    });
    if (import.meta.env.DEV) {
      let w = window as any;
      w.lf = newLf;
    }

    setProviderData("lf", newLf);
    setShouldShowRightPanel(true);
    newLf.batchRegister(Object.values(allNodes));
    newLf.setDefaultEdgeType(sequenceFlow.type);
    newLf.render();
    newLf.on("node:click,edge:click", (data) => {
      let nodeOrEdge = newLf.getModelById(data.data.id);
      setProviderData("currentModel", nodeOrEdge);
    });
    newLf.on("blank:click", () => {
      setProviderData("currentModel", undefined);
    });
    if (props.lf) {
      props.lf(newLf);
    }
  };
  onMount(updateLf);
  let fileFuncs = useFileDialog({
    multiple: false,
  });
  fileFuncs.onChange(async (fileList) => {
    if (fileList) {
      let file = fileList.item(0);
      if (file) {
        let content = await readFile(file);
        providerData.lf.render(content);
      }
    }
  });
  return (
    <div classList={{ [style.container]: true }}>
      <LogicFlowContext.Provider
        value={{
          providerData: contextStore[0],
          setProviderData: contextStore[1],
        }}>
        {props.state === "edit" && providerData.lf ? (
          <LeftDndPanel></LeftDndPanel>
        ) : (
          ""
        )}
        <div class={style["center-content"]}>
          {/* 顶部栏，工具按钮什么的 */}
          <Show when={() => props.state === "edit" && providerData.lf}>
            <div class={style.top}>
              <div class={style["top-left"]}></div>
              <div class={style["top-center"]}>logicflow</div>
              <div class={style["top-right"]}>
                <button onClick={() => fileFuncs.open()}>导入</button>
                <button
                  onClick={() => {
                    let xml = providerData.lf.getGraphData();
                    downloadTxt(xml, "bpmn.bpmn");
                    console.log("导出完毕");
                  }}>
                  导出
                </button>
              </div>
            </div>
          </Show>
          <div
            class={style.logicFLowContainer}
            ref={dom}></div>
        </div>

        {shouldShowRightPanel() ? <RightPanel></RightPanel> : ""}
      </LogicFlowContext.Provider>
    </div>
  );
};
