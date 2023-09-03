import { ModelComponent } from "@/utils/extend";

export let Input: ModelComponent<{}> = (props) => {
  let model = props.model;
  return (
    <input
      value={model[0]()}
      onInput={(e) => {
        model[1](e.target.value);
      }}></input>
  );
};
