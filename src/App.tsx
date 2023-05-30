import { Component, onMount } from "solid-js";
import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/style/index.css";
import style from "./App.module.css";
const App: Component = () => {
  let dom: HTMLDivElement | undefined = undefined;
  onMount(() => {
    let lf = new LogicFlow({
      container: dom!,
      grid: {
        type: "dot",
        size: 20,
      },
    });
    lf.render();
  });
  return (
    <div
      id={style.container}
      ref={dom}></div>
  );
};

export default App;
