import { Component, JSXElement, useContext } from "solid-js";
import { FormContext } from ".";
import type { Position } from "./index";
interface FormItemProp {
  label?: string | (() => JSXElement);
  /**label后缀，label字段为函数或labelPosition为top时失效 */
  labelSuffix?: string;
  /**用于覆盖Form组件的配置 */
  labelPosition?: Position;
  children?: JSXElement;
}
export let FormItem: Component<FormItemProp> = (props) => {
  let formProps = useContext(FormContext);
  let labelPosition = formProps.labelPosition || props.labelPosition || "left";
  let labelSuffix = props.labelSuffix || props.labelSuffix || "";
  function getLabel() {
    if (!props.label) {
      return;
    }
    if (typeof props.label === "function") {
      return props.label();
    }
    let final;
    if (typeof props.label === "string") {
      final = props.label;
      if (labelPosition === "left" && labelSuffix) {
        final += labelSuffix;
      }
    }
    if (final) {
      if (labelPosition === "left") {
        return <label>{final}</label>;
      } else if (labelPosition === "top") {
        return (
          <div style={{ "text-align": "left" }}>
            <label>{final}</label>
          </div>
        );
      }
    }
    return "";
  }
  return (
    <div>
      {getLabel()}
      {props.children}
    </div>
  );
};
