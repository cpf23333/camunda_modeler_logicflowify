import {
  BaseNodeModel,
  EdgeConfig,
  GraphModel,
  PolylineEdge,
  PolylineEdgeModel,
} from "@logicflow/core";
import { nodeDefinition } from "../../types";
import { getBpmnId } from "../../utils";
import { Collapse } from "../../components/collapse/index";
import { FormItem } from "@/components/Form";
import { TextArea } from "@/components/Form/TextArea";
import { startEvent } from "../event/startEvent";
class SequenceFlowModel extends PolylineEdgeModel {
  static extendKey = "SequenceFlowModel";
  constructor(data: EdgeConfig, graphModel: GraphModel) {
    if (!data.id) {
      data.id = `Flow_${getBpmnId()}`;
    }
    super(data, graphModel);
  }
}

class SequenceFlowView extends PolylineEdge {
  static extendKey = "SequenceFlowEdge";
}
export let sequenceFlow: nodeDefinition = {
  name: "连线",
  icon: "",
  type: "bpmn:sequenceFlow",
  model: SequenceFlowModel,
  view: SequenceFlowView,
  modelRender(params) {
    let sourceNode: BaseNodeModel = params.currentModel.sourceNode;
    if (sourceNode.type === startEvent.type) {
      return;
    }
    let [state, setState] = params.lf.getForm<{
      expression: string;
    }>(params.currentModel.id);
    return [
      <Collapse
        title="条件"
        id="condition"
        lf={params.lf}>
        <FormItem label="条件表达式">
          <TextArea
            value={state.baseModel.expression || ""}
            onChange={(e) => {
              setState("baseModel", "expression", e.target.value);
            }}></TextArea>
        </FormItem>
      </Collapse>,
    ];
  },
  adapterOut(params) {
    return {};
  },
};
