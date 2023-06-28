import {
  CircleNode,
  CircleNodeModel,
  GraphModel,
  NodeConfig,
} from "@logicflow/core";
import { nodeDefinition } from "../../types";
import { getBpmnId } from "../../utils";
import startEventSvg from "./startEvent.svg?raw";
import { createStore } from "solid-js/store";
import { CustomIcon } from "solid-icons";
class StartEventModel extends CircleNodeModel {
  static extendKey = "StartEventModel";
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
    // fix: 不能直接全部加，会导致下载后再次上传，位置错误。
    // data.text.y += 40;
    super(data, graphModel);
  }
  setAttributes(): void {
    this.r = 18;
  }
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules();
    const notAsTarget = {
      message: "起始节点不能作为边的终点",
      validate: () => false,
    };
    rules.push(notAsTarget);
    return rules;
  }
}

class StartEventView extends CircleNode {
  static extendKey = "StartEventNode";
}
export let startEvent: nodeDefinition = {
  name: () => "开始节点",
  icon: (config = {}) => (
    <CustomIcon
      size={config.size}
      src={{
        a: {
          viewBox: "0 0 32 32",
          fill: "white",
          "stroke-width": "2",
          "stroke-opacity": "1",
          stroke: "black",
        },
        c: `<circle cx="16" cy="16" r="16" fill="#FFFFFF" fill-opacity="1" stroke-width="2" stroke="#000000" stroke-opacity="1"></circle>`,
      }}></CustomIcon>
  ),
  type: "bpmn:startEvent",
  model: StartEventModel,
  view: StartEventView,
  initModel(params) {
    console.log("自定义的初始化");
    return createStore({
      baseModel: {},
      collapseData: {},
      extensionElements: [],
      generalData: { id: params.model.id, name: params.model.text.value },
    });
  },
};
