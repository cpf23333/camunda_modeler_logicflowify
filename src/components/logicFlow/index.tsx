import {
  Component,
  createContext,
  createSignal,
  mergeProps,
  onMount,
} from "solid-js";
import { Logicflow } from "./class";
import { allNodes } from "./nodes";
import style from "./index.module.scss";
import { LeftDndPanel } from "./components/dndPanel";
import { RightPanel } from "./components/rightPanel";
import { sequenceFlow } from "./nodes/edges/sequenceFlow";
import { BaseModel } from "./types";
import { createStore } from "solid-js/store";
import { ContextPad } from "./plugins/contextPad";
import "@logicflow/core/dist/style/index.css";
import "@logicflow/extension/lib/style/index.css";
import "./style/index.scss";
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
  state?: "edit" | "view";
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
      plugins: [ContextPad],
    });
    setProviderData("lf", newLf);
    setShouldShowRightPanel(true);
    newLf.batchRegister(Object.values(allNodes));
    newLf.setDefaultEdgeType(sequenceFlow.type);
    newLf.render();
    console.log("eidt");
    if (props.state === "edit") {
    }
    newLf.on("node:click,edge:click", (data) => {
      console.log("点击");

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
        <div
          class={style.logicFLowContainer}
          ref={dom}></div>
        {shouldShowRightPanel() ? <RightPanel></RightPanel> : ""}
      </LogicFlowContext.Provider>
    </div>
  );
};
