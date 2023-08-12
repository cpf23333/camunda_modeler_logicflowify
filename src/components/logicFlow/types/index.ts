import {
  BaseEdge,
  BaseEdgeModel,
  BaseNode,
  BaseNodeModel,
} from "@logicflow/core";
import { JSX } from "solid-js/jsx-runtime";
import { createStore } from "solid-js/store";
import { Forms, Logicflow } from "../class";
type initParams = {
  lf: Logicflow;
  model: BaseNodeModel | BaseEdgeModel;
};
export type BaseModel = BaseNodeModel | BaseEdgeModel;
export type BaseView = BaseNode | BaseEdge;
type checkCurrentOrInitParams = {
  /**这个节点的json数据 */
  json: DeepReadonly<Record<string, any>>;
  lf: Logicflow;
};
export type renderParams<
  BaseModelData = any,
  collapseData = any,
  generalData = any,
  extensionElementsData = any,
> = {
  /**当前选中的节点或线 */
  currentModel: BaseEdgeModel | BaseNodeModel;
  /**logicFlow实例 */
  lf: Logicflow;
  /**该节点的表单数据，包含get和set */
  form: ReturnType<
    typeof createStore<
      Forms<BaseModelData, collapseData, generalData, extensionElementsData>
    >
  >;
};
export type adapterOutParam<
  BaseModelData = any,
  collapseData = any,
  generalData = any,
  extensionElementsData = any,
> = {
  /**当前选中的节点或线 */
  currentModel: BaseEdgeModel | BaseNodeModel;
  /**logicFlow实例 */
  lf: Logicflow;
  /**该节点的表单数据，包含get和set */
  /**该节点的表单数据，只有get */
  form: DeepReadonly<
    Forms<BaseModelData, collapseData, generalData, extensionElementsData>
  >;
};
export type adapterInParam = {
  /**形状的json */
  shape: Record<string, any>;
  /**标签的json */
  tag: Record<string, any>;
  lf: Logicflow;
};

export interface adapterOutData {
  /**标签上的属性和子标签 */
  tag?: Record<string, any>;
  /**标签对应形状标签上的属性 */
  shape?: {
    /**图像的id，为对应节点的id+_di */
    "-id"?: string;
    /**对应节点的id */
    "-bpmnElement"?: string;
    "dc:Bounds"?: Record<string, any>;
    "bpmndi:BPMNLabel"?: {
      "dc:Bounds"?: Record<string, any>;
    } & { [x in string]: any };
  } & { [x in string]: any };
}
/**bpmn节点定义 */
export interface nodeDefinition<
  BaseModelData = any,
  collapseData = any,
  generalData = any,
  extensionElementsData = any,
> {
  /**用户可以看到的节点类型名称 */
  name: () => string;
  /**svg图标
   *
   * 设计上为必填
   *
   * 如果真的不需要，传个`()=>""`吧
   */
  icon: (config?: { size?: string | number }) => JSX.Element;
  /**
   * 节点类型，视为类型的id，一般直接传入bpmn标签名称即可
   *
   *也是logicFlow注册节点时需要的type
   */
  type: string;
  /**如果节点为多层标签嵌套形成，比如message start event
   *
   * 或者是业务上的自定义节点，可以设置这个字段为bpmn标签名，type字段为自定义的id
   */
  topTag?: string;
  /**用于区分该定义是否为线
   *
   * 设置为true则视为线，其余全部情况视为节点
   * @default false
   */
  isEdge?: boolean;
  /**logicFlow注册节点时需要的model */
  model: typeof BaseNodeModel | typeof BaseEdgeModel;
  /**logicFlow注册节点时需要的view */
  view: typeof BaseNode | typeof BaseEdge;
  /**初始化节点面板数据
   *
   * 返回值就是存储的数据
   *
   * view的properties也在这里面设置
   */
  initModel?: (
    params: initParams,
  ) => Partial<
    Forms<BaseModelData, collapseData, generalData, extensionElementsData>
  >;
  modelRenderConfig?: {
    /**是否有通用块(编辑名称和id) 默认为true */
    general: boolean;
    /**是否存在文档块，默认为true */
    documation: boolean;
    /**是否存在拓展属性，默认为true */
    extensionProperties: boolean;
  };
  /**右侧属性面板的渲染函数 */
  modelRender?: (
    params: renderParams<
      BaseModelData,
      collapseData,
      generalData,
      extensionElementsData
    >,
  ) => JSX.Element;
  /**传入json数据，返回是否为当前节点 */
  isCurrentNode?: (params: checkCurrentOrInitParams) => boolean | void;
  /**若isCurrentNode返回值为true或对应标签名称下只有这一个节点定义，则会调用这个函数
   *
   * 如果返回对象，则视为节点的properties
   */
  adapterIn?: (params: adapterInParam) => BaseModel["properties"] | void;
  /**将该节点实例的自定义数据导出为json */
  adapterOut?: (
    params: adapterOutParam<
      BaseModelData,
      collapseData,
      generalData,
      extensionElementsData
    >,
  ) => adapterOutData;
}
