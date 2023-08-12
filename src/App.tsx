import { type Component } from "solid-js";
import { Flow } from "./components/logicFlow";
import { Logicflow } from "./components/logicFlow/class";
let App: Component = () => {
  let Lf: Logicflow;
  return (
    <Flow
      state="edit"
      lf={(lf) => {
        Lf = lf;
      }}></Flow>
  );
};

export default App;
