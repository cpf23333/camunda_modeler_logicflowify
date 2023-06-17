import { Component, createUniqueId } from "solid-js";
import { Logicflow } from "../../class";
import { BaseModel } from "../../types";
import { AiOutlineDown, AiOutlineRight } from "solid-icons/ai";
import style from "./style.module.scss";
interface CollapseProp {
  /**标题 */
  title: string;
  children?: any;
  /**本面板在本节点内的的id */
  id: string;
  lf: Logicflow;
  /**当前选中的节点或线，不传入的话视为在编辑全局属性 */
  model?: BaseModel;
  /**是否默认折叠，默认为true */
  defaultCollapse?: boolean;
}
export let Collapse: Component<CollapseProp> = (props) => {
  let defaultCollapse = props.defaultCollapse;
  if (typeof defaultCollapse !== "boolean") {
    defaultCollapse = true;
  }
  let [state, setState] = props.lf.getForm<{}, {}>(
    props.model ? props.model.id : props.lf.processId,
  );
  let id = props.id || createUniqueId();
  if (state.collapseData[id] == undefined) {
    setState("collapseData", id, defaultCollapse);
  }
  return (
    <div class={style.collapse}>
      <div
        class={style.title}
        onClick={() => {
          setState("collapseData", id, !state.collapseData[id]);
        }}>
        <span>{props.title}</span>
        {state.collapseData[id] ? (
          <AiOutlineDown size={20} />
        ) : (
          <AiOutlineRight size={20} />
        )}
      </div>
      {state.collapseData[id] && props.children ? (
        <div class="content">{props.children}</div>
      ) : (
        ""
      )}
    </div>
  );
};
