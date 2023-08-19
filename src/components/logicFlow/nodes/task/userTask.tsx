import { DateSelect } from "@/components/Form/date";
import {
  GraphModel,
  NodeConfig,
  RectNode,
  RectNodeModel,
  h,
} from "@logicflow/core";
import { CustomIcon } from "solid-icons";
import { JSX } from "solid-js/jsx-runtime";
import { Collapse } from "../../components/collapse";
import { EqualInput } from "../../components/equalInput";
import { nodeDefinition } from "../../types";
import { getBpmnId } from "../../utils";
class UserTaskModel extends RectNodeModel {
  static extendKey = "UserTaskModel";
  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) {
      data.id = `Activity_${getBpmnId()}`;
    }
    super(data, graphModel);
  }
}

class UserTaskView extends RectNode {
  static extendKey = "UserTaskNode";
  getLabelShape() {
    const { model } = this.props;
    const { x, y, width, height } = model;
    const style = model.getNodeStyle();
    return h(
      "svg",
      {
        x: x - width / 2 + 5,
        y: y - height / 2 + 5,
        width: 25,
        height: 25,
        viewBox: "0 0 32 32",
      },
      [
        h("path", {
          fill: "white",
          stroke: "rgb(34, 36, 42)",
          "stroke-width": "0.5px",
          d: "m 15,12 c 0.909,-0.845 1.594,-2.049 1.594,-3.385 0,-2.554 -1.805,-4.62199999 -4.357,-4.62199999 -2.55199998,0 -4.28799998,2.06799999 -4.28799998,4.62199999 0,1.348 0.974,2.562 1.89599998,3.405 -0.52899998,0.187 -5.669,2.097 -5.794,4.7560005 v 6.718 h 17 v -6.718 c 0,-2.2980005 -5.5279996,-4.5950005 -6.0509996,-4.7760005 zm -8,6 l 0,5.5 m 11,0 l 0,-5",
        }),
        h("path", {
          fill: "white",
          stroke: "rgb(34, 36, 42)",
          "stroke-width": "0.5px",
          d: "m 15,12 m 2.162,1.009 c 0,2.4470005 -2.158,4.4310005 -4.821,4.4310005 -2.66499998,0 -4.822,-1.981 -4.822,-4.4310005",
        }),
        h("path", {
          //   fill: style.stroke,
          d: "m 15,12 m -6.9,-3.80 c 0,0 2.25099998,-2.358 4.27399998,-1.177 2.024,1.181 4.221,1.537 4.124,0.965 -0.098,-0.57 -0.117,-3.79099999 -4.191,-4.13599999 -3.57499998,0.001 -4.20799998,3.36699999 -4.20699998,4.34799999 z",
        }),
      ],
    );
  }
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
      }),
      this.getLabelShape(),
    ]);
  }
}
export let UserTask: nodeDefinition<
  {
    /**指定人 */
    assignee?: string;
    /**候选用户组 */
    group?: string;
    /**候选用户 */
    user?: string;
    /**到期日期 */
    dueDate?: string;
    /**跟催日期 */
    followUpDate?: string;
  },
  {},
  {},
  {},
  {
    "-assignee": string;
    "-candidateGroups": string;
    "-candidateUsers": string;
    "-dueDate": string;
    "-followUpDate": string;
  }
> = {
  name: function (): string {
    return "用户任务";
  },
  icon: function (
    config?: { size?: string | number | undefined } | undefined,
  ): JSX.Element {
    return (
      <CustomIcon
        size={config?.size}
        src={{
          a: { viewBox: "0 0 100 80" },
          c: `<rect x="0" y="0" width="100" height="80" rx="10" ry="10" style="stroke: rgb(34, 36, 42); stroke-width: 2px; fill: white; fill-opacity: 0.95;"></rect>
          <path d="m 15,12 c 0.909,-0.845 1.594,-2.049 1.594,-3.385 0,-2.554 -1.805,-4.62199999 -4.357,-4.62199999 -2.55199998,0 -4.28799998,2.06799999 -4.28799998,4.62199999 0,1.348 0.974,2.562 1.89599998,3.405 -0.52899998,0.187 -5.669,2.097 -5.794,4.7560005 v 6.718 h 17 v -6.718 c 0,-2.2980005 -5.5279996,-4.5950005 -6.0509996,-4.7760005 zm -8,6 l 0,5.5 m 11,0 l 0,-5" style="fill: white; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 0.5px;"></path>
          <path d="m 15,12 m 2.162,1.009 c 0,2.4470005 -2.158,4.4310005 -4.821,4.4310005 -2.66499998,0 -4.822,-1.981 -4.822,-4.4310005 " style="fill: white; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 0.5px;"></path>
          <path d="m 15,12 m -6.9,-3.80 c 0,0 2.25099998,-2.358 4.27399998,-1.177 2.024,1.181 4.221,1.537 4.124,0.965 -0.098,-0.57 -0.117,-3.79099999 -4.191,-4.13599999 -3.57499998,0.001 -4.20799998,3.36699999 -4.20699998,4.34799999 z" style="fill: rgb(34, 36, 42); stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 0.5px;"></path>`,
        }}></CustomIcon>
    );
  },
  type: "bpmn:userTask",
  model: UserTaskModel,
  view: UserTaskView,
  initModel(params) {
    return {};
  },
  modelRender(params) {
    let [model, setModel] = params.form;
    return [
      <Collapse
        title="分配"
        id="assignment">
        <EqualInput
          label="指定人"
          model={[
            () => model.baseModel.assignee || "",
            (val: string) => setModel("baseModel", "assignee", val),
          ]}></EqualInput>
        <EqualInput
          label="候选用户组"
          model={[
            () => model.baseModel.group,
            (val: string) => {
              setModel("baseModel", "group", val);
            },
          ]}></EqualInput>
        <EqualInput
          label="候选用户"
          model={[
            () => model.baseModel.user,
            (val) => {
              setModel("baseModel", "user", val);
            },
          ]}></EqualInput>
        <EqualInput
          label="到期日期"
          model={[
            () => model.baseModel.dueDate,
            (val) => {
              setModel("baseModel", "dueDate", val);
            },
          ]}
          input={({ equal }) => {
            let date = model.baseModel.dueDate || "";
            if (equal()) {
              date = date.replace("=", "");
            }
            return (
              <DateSelect
                type="datetime-local"
                format="YYYY-MM-DDTHH:mm"
                model={[
                  () => model.baseModel.dueDate,
                  (val: any) => {
                    console.log("due", val);
                    setModel("baseModel", "dueDate", val);
                  },
                ]}></DateSelect>
            );
          }}></EqualInput>
        <EqualInput
          label="跟催日期"
          model={[
            () => model.baseModel.followUpDate,
            (val) => {
              setModel("baseModel", "followUpDate", val);
            },
          ]}
          input={({ equal }) => {
            let date = model.baseModel.followUpDate || "";
            if (equal()) {
              date = date.replace("=", "");
            }
            return (
              <DateSelect
                type="datetime-local"
                format="YYYY-MM-DDTHH:mm"
                model={[
                  () => model.baseModel.followUpDate,
                  (val: any) => setModel("baseModel", "followUpDate", val),
                ]}></DateSelect>
            );
          }}></EqualInput>
      </Collapse>,
    ];
  },
  adapterOut(params) {
    let baseModel = params.form.baseModel;
    let tag: Record<string, any> = {};
    if (baseModel.assignee) {
      tag["-assignee"] = baseModel.assignee;
    }
    if (baseModel.group) {
      tag["-candidateGroups"] = baseModel.group;
    }
    if (baseModel.user) {
      tag["-candidateUsers"] = baseModel.user;
    }
    if (baseModel.dueDate) {
      tag["-dueDate"] = baseModel.dueDate;
    }
    if (baseModel.followUpDate) {
      tag["-followUpDate"] = baseModel.followUpDate;
    }
    return {
      tag: tag,
      shape: {
        "-bioc:stroke": "#0d4372",
        "-bioc:fill": "#bbdefb",
        "-color:background-color": "#bbdefb",
        "-color:border-color": "#0d4372",
      },
    };
  },
  adapterIn(params) {
    let json = params.tag;
    console.log(json);

    let form: Record<string, any> = {};
    if (json["-assignee"]) {
      form.assignee = json["-assignee"];
    }
    if (json["-candidateGroups"]) {
      form.group = json["-candidateGroups"];
    }
    if (json["-candidateUsers"]) {
      form.user = json["-candidateUsers"];
    }
    if (json["-dueDate"]) {
      form.dueDate = json["-dueDate"];
    }
    if (json["-followUpDate"]) {
      form.followUpDate = json["-followUpDate"];
    }
    return {
      form: {
        baseModel: form,
      },
    };
  },
};
