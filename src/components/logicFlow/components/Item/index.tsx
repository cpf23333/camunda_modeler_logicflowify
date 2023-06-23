import { Component, JSX, Show, createUniqueId } from "solid-js";
import style from "./item.module.scss";
import { BaseModel } from "../../types";
import { Logicflow } from "../../class";
import { AiOutlineDelete, AiOutlineDown, AiOutlineRight } from "solid-icons/ai";
interface ItemProp {
  title?: string;
  id: string;
  icon?: Component;
  model?: BaseModel;
  children?: JSX.Element;
  lf: Logicflow;
  onDelete: Function;
}
export let Item: Component<ItemProp> = (props) => {
  let [store, setStore] = props.lf.getForm(
    props.model ? props.model.id : props.lf.processId,
  );
  let id = props.id || createUniqueId();
  let toggleCollapse = () => {
    setStore("collapseData", id, !store.collapseData[id]);
  };
  if (!store.collapseData[id]) {
    setStore("collapseData", id, true);
  }
  return (
    <div class={style.item}>
      <div
        class={style.title}
        onClick={toggleCollapse}>
        {store.collapseData[id] ? <AiOutlineDown /> : <AiOutlineRight />}
        {props.title || "空"}
        <AiOutlineDelete
          color="red"
          classList={{
            [style.delete]: true,
          }}
          onClick={(e) => {
            e.stopPropagation();
            props.onDelete();
          }}
        />
      </div>

      <Show when={store.collapseData[id]}>
        <div class={style.content}>
          <div class={style.left}></div>
          <div class={style.right}>{props.children}</div>
        </div>
      </Show>
    </div>
  );
};
