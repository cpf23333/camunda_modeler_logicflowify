import { type Component } from "solid-js";
import sty from "./App.module.css";
let App: Component<{
  children?: any;
}> = (props) => {
  return (
    <div class={sty.container}>
      <div>
        <a href="/">常规页面</a>
        <a href="/elk">elk布局</a>
      </div>
      <div class={sty.child}>{props.children}</div>
    </div>
  );
};

export default App;
