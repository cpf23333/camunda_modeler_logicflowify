import {
  CircleNode,
  CircleNodeModel,
  GraphModel,
  NodeConfig,
  h,
} from "@logicflow/core";
import { getBpmnId } from "../../utils";
import { nodeDefinition } from "../../types";
import endEventSvg from "./endEvent.svg?raw";
import { General } from "../../components/rightPanel/common/general";
class EndEventModel extends CircleNodeModel {
  static extendKey = "EndEventModel";
  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) {
      data.id = `Event_${getBpmnId()}`;
    }
    if (!data.text) {
      data.text = "";
    }
    if (data.text && typeof data.text === "string") {
      data.text = {
        value: data.text,
        x: data.x,
        y: data.y + 40,
      };
    }
    super(data, graphModel);
  }
  setAttributes(): void {
    this.r = 18;
  }
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules();
    const notAsSource = {
      message: "结束节点不能作为边的起点",
      validate: () => false,
    };
    rules.push(notAsSource);
    return rules;
  }
}

class EndEventView extends CircleNode {
  static extendKey = "EndEventView";
  getAnchorStyle() {
    return {
      visibility: "hidden",
    };
  }
  getShape() {
    const { model } = this.props;
    const style = model.getNodeStyle();
    const { x, y, r } = model;
    const outCircle = super.getShape();
    return h(
      "g",
      {},
      outCircle,
      h("circle", {
        ...style,
        cx: x,
        cy: y,
        r: r - 5,
      }),
    );
  }
}

export const endEvent: nodeDefinition = {
  type: "bpmn:endEvent",
  icon: endEventSvg,
  view: EndEventView,
  model: EndEventModel,
  name: "结束节点",
  modelRender: (params) => {
    return (
      <div>
        <General
          model={params.currentModel}
          lf={params.lf}
        />
      </div>
    );
  },
};
