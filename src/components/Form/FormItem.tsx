import { Component, JSX, useContext } from "solid-js";
import { FormContext } from ".";
interface FormItemProp {
  label?: string | (() => JSX.Element);
  children?: JSX.Element;
}
export let FormItem: Component<FormItemProp> = (props) => {
  let formProps = useContext(FormContext);
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
      if (formProps.labelPosition === "left" && formProps.labelSuffix) {
        final += formProps.labelSuffix;
      }
    }
    if (final) {
      if (formProps.labelPosition === "left") {
        return <label>{final}</label>;
      } else if (formProps.labelPosition === "top") {
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
