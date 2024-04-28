import { Flow } from "@/components/logicFlow";
import { Logicflow } from "@/components/logicFlow/class";
import { Component, onMount } from "solid-js";
let page: Component = () => {
  let lf: Logicflow;
  onMount(() => {
    document.title = "ELK";
  });
  return (
    <div
      style={{ display: "flex", "flex-direction": "column", height: "100%" }}>
      <div style={{ "flex-shrink": 1 }}>
        <button
          onclick={() => {
            lf.doLayout();
          }}>
          排版
        </button>
      </div>
      <Flow
        state="edit"
        lf={(lfIns: Logicflow) => {
          lf = lfIns;
        }}></Flow>
    </div>
  );
};
export default page;
