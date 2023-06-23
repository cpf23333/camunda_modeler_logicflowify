import { Component, JSX } from "solid-js";

export let TextArea: Component<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>
> = (props) => {
  return (
    <textarea
      {...props}
      style={{ "min-width": "100%", "max-width": "100%" }}></textarea>
  );
};
