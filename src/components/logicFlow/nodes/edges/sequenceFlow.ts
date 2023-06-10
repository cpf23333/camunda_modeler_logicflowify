import {
  EdgeConfig,
  GraphModel,
  Point,
  PolylineEdge,
  PolylineEdgeModel,
} from "@logicflow/core";
import { nodeDefinition } from "../../types";
import { getBpmnId } from "../../utils";
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
  type: "",
  model: SequenceFlowModel,
  view: SequenceFlowView,
};
