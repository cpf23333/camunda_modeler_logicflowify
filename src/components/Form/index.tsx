import { Component, JSX, JSXElement, createContext } from "solid-js";
import style from "./style.module.scss";
export { FormItem } from "./FormItem";
export type Position = "left" | "top";
interface FromProp {
  children?: JSXElement;
  /**label后缀，label字段为函数或labelPosition为top时失效 */
  labelSuffix?: string;
  labelPosition?: Position;
  classList?: JSX.CustomAttributes<HTMLFormElement>["classList"];
}
export let FormContext = createContext({
  labelSuffix: "",
  labelPosition: "left" as Position,
});
export let Form: Component<FromProp> = (props) => {
  let context = {
    labelSuffix: props.labelSuffix || "",
    labelPosition: props.labelPosition || "left",
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      classList={{ [style.form]: true, ...(props.classList || {}) }}>
      <FormContext.Provider value={context}>
        {props.children}
      </FormContext.Provider>
    </form>
  );
};
