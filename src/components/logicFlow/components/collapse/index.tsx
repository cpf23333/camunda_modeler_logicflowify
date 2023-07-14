import { AiOutlineDown, AiOutlinePlus, AiOutlineRight } from "solid-icons/ai";
import { Component, Show, createUniqueId, useContext } from "solid-js";
import { LogicFlowContext } from "../..";
import { BaseModel } from "../../types";
import style from "./style.module.scss";
interface CollapseProp {
  /**标题 */
  title: string;
  children?: any;
  /**本面板在本节点内的的id */
  id: string;
  /**当前选中的节点或线，不传入的话视为在编辑全局属性 */
  model?: BaseModel;
  /**是否默认折叠，默认为true */
  defaultCollapse?: boolean;
  /**如果配置了这个函数，那么就会有新增按钮 */
  onAdd?: () => void;
}
export let Collapse: Component<CollapseProp> = (props) => {
  let lf = useContext(LogicFlowContext).providerData.lf;
  let defaultCollapse = props.defaultCollapse;
  if (typeof defaultCollapse !== "boolean") {
    defaultCollapse = true;
  }
  let [state, setState] = lf.getForm<{}, {}>(
    props.model ? props.model.id : lf.processId,
  );
  let id = props.id || createUniqueId();
  if (state.collapseData[id] == undefined) {
    setState("collapseData", id, defaultCollapse);
  }
  let toggleCollapse = () => {
    setState("collapseData", id, !state.collapseData[id]);
  };
  return (
    <div class={style.collapse}>
      <div
        class={style.title}
        onClick={toggleCollapse}>
        <span class={style["title-content"]}>{props.title}</span>
        <span
          class={style["title-icons"]}
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <Show when={props.onAdd}>
            <AiOutlinePlus
              onClick={() => {
                if (!state.collapseData[id]) {
                  setState("collapseData", id, true);
                }
                props.onAdd && props.onAdd();
              }}></AiOutlinePlus>
          </Show>
          {state.collapseData[id] ? (
            <AiOutlineDown onClick={toggleCollapse} />
          ) : (
            <AiOutlineRight onClick={toggleCollapse} />
          )}
        </span>
      </div>
      {state.collapseData[id] && props.children ? (
        <div class="content">{props.children}</div>
      ) : (
        ""
      )}
    </div>
  );
};
