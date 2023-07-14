import { FormItem } from "@/components/Form";
import { TextArea } from "@/components/Form/TextArea";
import {
  BaseNodeModel,
  EdgeConfig,
  GraphModel,
  PolylineEdge,
  PolylineEdgeModel,
} from "@logicflow/core";
import { CustomIcon } from "solid-icons";
import { Collapse } from "../../components/collapse/index";
import { nodeDefinition } from "../../types";
import { getBpmnId } from "../../utils";
import { StartEvent } from "../event/startEvent";
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
  name: () => "连线",
  icon: (config = {}) => {
    return (
      <CustomIcon
        size={config.size}
        src={{
          a: {
            viewBox: "0 0 32 32",
          },
          c: `<path d="M32 17 L32 18 L0 18 L0 17z" fill="black" stroke-width="1" stroke="transparent" stroke-dasharray="4, 4"></path>`,
        }}></CustomIcon>
    );
  },
  type: "bpmn:sequenceFlow",
  model: SequenceFlowModel,
  view: SequenceFlowView,
  modelRender(params) {
    let sourceNode: BaseNodeModel = params.currentModel.sourceNode;
    if (sourceNode.type === StartEvent.type) {
      return;
    }
    let [state, setState] = params.lf.getForm<{
      expression: string;
    }>(params.currentModel.id);
    return [
      <Collapse
        title="条件"
        id="condition">
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
