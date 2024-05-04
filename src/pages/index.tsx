import { Flow } from "@/components/logicFlow";
import { Logicflow } from "@/components/logicFlow/class";
import { Component, onMount } from "solid-js";
let page: Component = () => {
  let Lf: Logicflow;
  onMount(() => {
    document.title = "常规页面";
  });
  return (
    <Flow
      state="edit"
      lf={(lf: Logicflow) => {
        Lf = lf;
      }}></Flow>
  );
};
export default page;