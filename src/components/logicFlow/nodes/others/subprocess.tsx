import { GraphModel } from "@logicflow/core";
import { GroupNode } from "@logicflow/extension";
import { nodeDefinition } from "../../types";
let view = GroupNode.view;
let model = GroupNode.model;
class subProcessView extends view {}
class subProcessModel extends model {
  constructor(data: any, graphModel: GraphModel) {
    super(data, graphModel);
    this.resizable = true;
    this.foldable = true;
  }
}
/**子流程节点 */
export let subProcess: nodeDefinition = {
  name: () => "子流程",
  icon: () => {
    return "";
  },
  type: "bpmn:subProcess",
  model: subProcessModel,
  view: subProcessView,
  adapterIn(params) {},
  adapterOut(params) {
    let model = params.currentModel;
    let tag: Record<string, any> = {
      "-id": model.id,
      "-name": model.text.value,
    };
    return {
      tag: tag,
    };
  },
};
