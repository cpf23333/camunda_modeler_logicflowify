import { JSX } from "solid-js/jsx-runtime";
import { nodeDefinition } from "../../types";
import { h } from "@logicflow/core";
import {
  GraphModel,
  NodeConfig,
  RectNode,
  RectNodeModel,
} from "@logicflow/core";
import { getBpmnId } from "../../utils";
import { CustomIcon } from "solid-icons";
class TaskModel extends RectNodeModel {
  static extendKey = "TaskModel";
  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) {
      data.id = `Activity_${getBpmnId()}`;
    }
    super(data, graphModel);
    this.radius = 10;
  }
}

class TaskView extends RectNode {
  static extendKey = "UserTaskNode";
  getShape() {
    const { model } = this.props;
    const { x, y, width, height, radius } = model;
    const style = model.getNodeStyle();
    // todo: 将basic-shape对外暴露，在这里可以直接用。现在纯手写有点麻烦。
    return h("g", {}, [
      h("rect", {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ]);
  }
}
export let TaskEvent: nodeDefinition = {
  name() {
    return "任务节点";
  },
  icon: function (
    config?: { size?: string | number | undefined } | undefined,
  ): JSX.Element {
    return (
      <CustomIcon
        size={config?.size}
        src={{
          a: { viewBox: "0 0 100 80" },
          c: `<rect width="100" height="80" rx="10" ry="10" style="stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 2px; fill: white; fill-opacity: 0.95;"></rect>`,
        }}></CustomIcon>
    );
  },
  type: "bpmn:task",
  model: TaskModel,
  view: TaskView,
};
