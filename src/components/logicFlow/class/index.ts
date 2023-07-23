import { Definition, LogicFlow as oldLogicFlow } from "@logicflow/core";
import { createStore } from "solid-js/store";
import { allNodes } from "../nodes";
import { getBpmnId } from "../utils";
export type GeneralModel<T = any> = T & {
  /**节点或线的id */
  id: string;
  /**名称 */
  name: string;
};
type customObj<T = {}> = T & {
  /**自定义字段，可以自由使用 */
  [x: string]: any;
};
type extensionElement = {
  name: string;
  value: string;
};
export interface Forms<
  /**基础表单，面板用的数据对象 */
  baseModelCustomData = {},
  /**控件折叠数据对象 */
  collapseCustomData = {},
  /**基本数据对象，名称id什么的 */
  generalCustomData = GeneralModel<customObj>,
  /**拓展属性存储 */
  extensionElementsData = Array<extensionElement>,
> {
  /**常规情况下都使用这个存储rightPanel的表单数据 */
  baseModel: customObj<baseModelCustomData>;
  /**折叠面板状态存储区 */
  collapseData: customObj<collapseCustomData>;
  /**基本信息 */
  generalData: GeneralModel<generalCustomData> & customObj;
  /**拓展属性 */
  extensionElements: extensionElementsData;
}
type NodeOrEdgeId = string;

export class Logicflow extends oldLogicFlow {
  processId: string;
  constructor(options: Definition) {
    super(options);
    this.processId = `Process_${getBpmnId()}`;
    this.initForm(this.processId, {
      generalData: {
        name: "",
        id: `Process_${getBpmnId()}`,
        isExecutable: true,
      },
    });
  }
  /**默认的初始化表单功能，如果这个就够用的话，不需要给nodeDefinition设置initModel */
  initForm(id: NodeOrEdgeId, initData?: Partial<Forms>) {
    let model = this.getModelById(id);
    if (id !== this.processId) {
      let targetType = allNodes[model.type];
      if (targetType && targetType.initModel) {
        let defaultForm: Forms = {
          baseModel: {},
          collapseData: {},
          generalData: {
            id: id,
            name: model.text.value,
          },
          extensionElements: [],
        };
        let data = Object.assign(
          {},
          defaultForm,
          targetType.initModel({ lf: this, model }),
        );
        this.forms[id] = createStore(data);
        return;
      }
    }
    this.forms[id] = createStore<
      Forms<{}, {}, GeneralModel, extensionElement[]>
    >({
      baseModel: {},
      collapseData: {},
      generalData: {
        id: id,
        name: model?.text?.value || "",
      },
      extensionElements: [],
      ...(initData || {}),
    });
  }
  getForm<
    baseModel = {},
    collapseData = {},
    generalData = {},
    extensionElements = extensionElement[],
  >(
    id: NodeOrEdgeId,
  ): ReturnType<
    typeof createStore<
      Forms<baseModel, collapseData, generalData, extensionElements>
    >
  > {
    if (!this.forms[id]) {
      this.initForm(id);
    }
    return this.forms[id];
  }
  mvForm(oldId: string, newId: string) {
    this.forms[newId] = this.forms[oldId];
    delete this.forms[oldId];
  }
  /**实际存储 */
  private forms: Record<
    NodeOrEdgeId,
    ReturnType<typeof createStore<Forms<any, any, any, any>>>
  > = {};
}
