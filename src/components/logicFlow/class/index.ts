import { Definition, LogicFlow as oldLogicFlow } from "@logicflow/core";
import { merge } from "lodash-es";
import { createStore } from "solid-js/store";
import { reactifyObject } from "solidjs-use";
import { allNodes } from "../nodes";
import { getBpmnId } from "../utils";
export type GeneralModel<T = any> = T & {
  /**节点或线的id */
  id: string;
  /**名称 */
  name: string;
  /**文档 */
  document: string;
  /**自定义字段，可以自由使用 */
  [x: string]: any;
};
type customObj<T = {}> = T & {
  /**自定义字段，可以自由使用 */
  [x: string]: any;
};
type extensionElement = {
  name: string;
  value: string;
};
/**通用的右侧属性面板数据结构 */
export interface Forms<
  /**基础表单，面板用的数据对象 */
  baseModelCustomData = {},
  /**控件折叠数据对象 */
  collapseCustomData = {},
  /**基本数据对象，名称id什么的 */
  generalCustomData = {},
  /**拓展属性存储 */
  extensionElementsData = Array<extensionElement>,
> {
  /**常规情况下都使用这个存储rightPanel的表单数据 */
  baseModel: customObj<baseModelCustomData>;
  /**折叠面板状态存储区 */
  collapseData: customObj<collapseCustomData>;
  /**基本信息 */
  generalData: GeneralModel<generalCustomData>;
  /**拓展属性 */
  extensionElements: extensionElementsData;
}
export interface ReadOnlyForms<
  /**基础表单，面板用的数据对象 */
  baseModelCustomData = {},
  /**控件折叠数据对象 */
  collapseCustomData = {},
  /**基本数据对象，名称id什么的 */
  generalCustomData = {},
  /**拓展属性存储 */
  extensionElementsData = Array<extensionElement>,
> {
  /**常规情况下都使用这个存储rightPanel的表单数据 */
  baseModel: Readonly<customObj<baseModelCustomData>>;
  /**折叠面板状态存储区 */
  collapseData: Readonly<customObj<collapseCustomData>>;
  /**基本信息 */
  generalData: Readonly<GeneralModel<generalCustomData>>;
  /**拓展属性 */
  extensionElements: ReadonlyArray<extensionElementsData>;
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
        document: "",
      },
    });
  }
  /**默认的初始化表单功能
   *
   * 如果不传入initData，则本身逻辑只会初始化GeneralData。*/
  initForm(id: NodeOrEdgeId, initData?: Partial<Forms>) {
    if (id === this.processId) {
      this.forms[id] = createStore<
        Forms<{}, {}, GeneralModel, extensionElement[]>
      >(
        merge(
          {
            baseModel: {},
            collapseData: {},
            generalData: {
              id: id,
              name: "",
            },
            extensionElements: [],
          },
          initData || {},
        ),
      );
    } else {
      let model = this.getModelById(id);
      let targetDef = allNodes[model.type];
      let defaultForm: Forms = {
        baseModel: {},
        collapseData: {},
        generalData: {
          id: id,
          name: model.text?.value,
          document: "",
        },
        extensionElements: [],
        ...(initData || {}),
      };
      if (targetDef && targetDef.initModel) {
        defaultForm = merge(
          defaultForm,
          targetDef.initModel({ lf: this, model }),
        );
        this.forms[id] = createStore(defaultForm);
      } else {
        this.forms[id] =
          createStore<Forms<{}, {}, GeneralModel, extensionElement[]>>(
            defaultForm,
          );
      }
    }
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
  > = reactifyObject({});
}
