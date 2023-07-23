import { ModelComponent } from "@/utils/extend";
import { Show, createEffect, createSignal } from "solid-js";
import style from "./style.module.scss";

interface EqualInputProp {
  /**标题 */
  label: string;
}
export let EqualInput: ModelComponent<EqualInputProp> = (props) => {
  let [model, setModel] = props["model"];
  let [equal, setEqual] = createSignal(false);
  let [visibleVal, setVisibleVal] = createSignal("");
  createEffect(() => {
    let val = model();
    if (typeof val === "string") {
      if (val.startsWith("=")) {
        setEqual(true);
        setVisibleVal(val.slice(1, val.length));
      } else {
        setEqual(false);
        setVisibleVal(val);
      }
    }
  });
  return (
    <div
      classList={{
        [style.item]: true,
        [style.active]: equal(),
      }}>
      <div class={style.label}>
        {props.label}
        <svg
          onClick={() => {
            let val: string = model() || "";
            if (equal()) {
              setModel(val.slice(1, val.length));
            } else {
              setModel("=" + val);
            }
          }}
          style={{ width: "16px", height: "16px" }}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5.845 7.04V5.93h4.307v1.11H5.845Zm0 3.07V9h4.307v1.11H5.845Z"
            fill="currentColor"></path>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M3.286 8a4.714 4.714 0 1 0 9.428 0 4.714 4.714 0 0 0-9.428 0ZM8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Z"
            fill="currentColor"></path>
        </svg>
      </div>
      <div class={style.content}>
        <Show when={equal()}>
          <div class={style.equal}>=</div>
          <textarea
            value={visibleVal()}
            onInput={(e) => {
              let val = e.target.value;
              if (equal()) {
                setModel("=" + val);
              } else {
                setModel(val);
              }
            }}></textarea>
        </Show>
        <Show when={!equal()}>
          <input
            value={visibleVal()}
            onInput={(e) => {
              let val = e.target.value;
              if (equal()) {
                setModel("=" + val);
              } else {
                setModel(val);
              }
            }}></input>
        </Show>
      </div>
    </div>
  );
};
