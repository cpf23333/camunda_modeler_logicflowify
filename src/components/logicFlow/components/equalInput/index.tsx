import { ModelComponent } from "@/utils/extend";

interface EqualInputProp {
  /**标题 */
  label: string;
}
export let EqualInput: ModelComponent<EqualInputProp> = (props) => {
  let [model, setModel] = props["model"];
  return (
    <div>
      <label>
        {props.label} <button>=</button>
      </label>
      <input
        value={model()}
        onInput={(e) => {
          setModel(e.target.value);
        }}></input>
    </div>
  );
};
