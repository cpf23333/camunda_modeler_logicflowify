import { type Component } from "solid-js";
import "@logicflow/core/dist/style/index.css";

import { Flow } from "./components/logicFlow";
import { Logicflow } from "./components/logicFlow/class";
let App: Component = () => {
  let Lf: Logicflow;
  return (
    <Flow
      lf={(lf) => {
        Lf = lf;
      }}></Flow>
  );
};

export default App;
