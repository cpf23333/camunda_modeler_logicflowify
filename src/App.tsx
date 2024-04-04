import { type Component } from "solid-js";
let App: Component<{
  children?: any;
}> = (props) => {
  return (
    <div>
      <div>
        <a href="/">常规页面</a>
        <a href="/elk">elk布局</a>
      </div>
      {props.children}
    </div>
  );
};

export default App;
