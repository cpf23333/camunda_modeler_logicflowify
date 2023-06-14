import {
  Component,
  createEffect,
  createSignal,
  mergeProps,
  onMount,
} from "solid-js";
import { Logicflow } from "./class";
import { allNodes } from "./nodes";
import style from "./index.module.scss";
import { LeftDndPanel } from "./components/dndPanel";
import { RightPanel } from "./components/rightPanel";
import { BaseEdgeModel, BaseNodeModel } from "@logicflow/core";
import { sequenceFlow } from "./nodes/edges/sequenceFlow";
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
  let [lf, setLf] = createSignal<Logicflow>(undefined as unknown as Logicflow);
  let dom: HTMLDivElement | undefined = undefined;
  let [shouldShowRightPanel, setShouldShowRightPanel] =
    createSignal<boolean>(false);
  let [currentNodeOrEdge, setCurrentNodeOrEdge] = createSignal<
    BaseNodeModel | BaseEdgeModel | undefined
  >(undefined);
  let updateLf = () => {
    if (props.state === "edit") {
    }
    setLf(
      new Logicflow({
        container: dom!,
        grid: {
          type: "dot",
          size: 20,
        },
      }),
    );
    setShouldShowRightPanel(true);
    lf().batchRegister(Object.values(allNodes));
    lf().setDefaultEdgeType(sequenceFlow.type);
    lf().render();
    if (props.lf) {
      props.lf(lf());
    }
    createEffect(() => {
      console.log("eidt");
      if (props.state === "edit") {
      }
      lf().on("node:click,edge:click", (data) => {
        let nodeOrEdge = lf().getModelById(data.data.id);
        setCurrentNodeOrEdge(nodeOrEdge);
      });
      lf().on("blank:click", () => {
        setCurrentNodeOrEdge(undefined);
      });
    });
  };
  onMount(updateLf);
  return (
    <div classList={{ [style.container]: true }}>
      {props.state === "edit" && lf ? (
        <LeftDndPanel lf={lf()}></LeftDndPanel>
      ) : (
        ""
      )}
      <div
        class={style.logicFLowContainer}
        ref={dom}></div>
      {shouldShowRightPanel() ? (
        <RightPanel
          currentNodeOrEdge={currentNodeOrEdge()}
          lf={lf()}></RightPanel>
      ) : (
        ""
      )}
    </div>
  );
};
