import { GraphModel } from "@logicflow/core";
import { GroupNode, GroupNodeModel } from "@logicflow/extension";
import { getGraphConfigData } from "../../plugins/Adapter";
import { nodeDefinition } from "../../types";
class subProcessView extends GroupNode {}
class subProcessModel extends GroupNodeModel {
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
    return "icon";
  },
  type: "bpmn:subProcess",
  model: subProcessModel,
  view: subProcessView,
  adapterIn(params) {
    let childG = getGraphConfigData({
      tagDatas: params.tag,
      lf: params.lf,
      plane: params.plane,
    });
    if (!params.graphConfigData.edges) {
      params.graphConfigData.edges = [];
    }
    if (!params.graphConfigData.nodes) {
      params.graphConfigData.nodes = [];
    }
    params.graphConfigData.edges.push(...(childG.edges || []));
    params.graphConfigData.nodes.push(...(childG.nodes || []));
    let childNodeIds: string[] = [...childG.children];
    return {
      form: {
        baseModel: {},
      },
      children: childNodeIds,
    };
  },
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
