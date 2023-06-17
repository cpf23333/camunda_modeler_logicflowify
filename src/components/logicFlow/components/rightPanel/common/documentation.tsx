import { Component } from "solid-js";
import { Collapse } from "../../collapse";
import { Logicflow } from "@/components/logicFlow/class";
import { BaseModel } from "@/components/logicFlow/types";
import { FormItem } from "@/components/Form";
interface DocumentationProp {
  lf: Logicflow;
  currentNodeOrEdge: BaseModel;
}
export let Documentation: Component<DocumentationProp> = (props) => {
  let [state, setState] = props.lf.getForm<{}, {}, { document: string }>(
    props.currentNodeOrEdge.id,
  );
  return (
    <Collapse
      lf={props.lf}
      title="文档"
      id="documatation">
      <FormItem label="节点文档">
        <textarea
          style={{ width: "-webkit-fill-available" }}
          value={state.generalData.document || ""}
          onChange={(e) => {
            setState("generalData", "document", e.target.value);
          }}></textarea>
      </FormItem>
    </Collapse>
  );
};
