import {
  BaseEdge,
  BaseEdgeModel,
  BaseNode,
  BaseNodeModel,
  EdgeConfig,
  GraphConfigData,
  NodeConfig,
} from "@logicflow/core";
import { JSX } from "solid-js/jsx-runtime";
import { createStore } from "solid-js/store";
import { Forms, Logicflow } from "../class";
export type initParams = {
  lf: Logicflow;
  model: BaseNodeModel | BaseEdgeModel;
};
export type BaseModel = BaseNodeModel | BaseEdgeModel;
export type BaseView = BaseNode | BaseEdge;
type checkCurrentOrInitParams = {
  /**这个节点的json数据 */
  json: Readonly<Record<string, any>>;
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
  form: Readonly<
    Forms<BaseModelData, collapseData, generalData, extensionElementsData>
  >;
  rootTags: Record<string, any>;
  rootShapes: Record<string, any>;
};
export type adapterInParam<xmlJson = {}> = {
  /**形状的json */
  shape: Record<string, any>;
  /**标签的json */
  tag: {
    "-id"?: string;
    "-name"?: string;
    "bpmn:documentation"?: {
      "#text"?: string;
    };
  } & xmlJson;
  lf: Logicflow;
  /**bpmndi:BPMNPlane标签，可以通过这个读取所有节点的形状数据 */
  plane: {
    "bpmndi:BPMNShape": any[];
    "bpmndi:BPMNEdge": any[];
  };
  graphConfigData: GraphConfigData;
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
  xmlJson = Record<string, any>,
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
   * 接收到节点的标签数据，形状数据，返回表单数据及节点的properties
   *
   * 该函数调用时，xml对应的节点尚未在画布上渲染
   *
   * 所以如果需要读取节点对应的model，需要用`setTimeOut(func,0)`
   */
  adapterIn?: (params: adapterInParam<xmlJson>) => {
    /**logicFlow数据的属性字段 */
    properties?: BaseModel["properties"] & {
      /**元素的大小，这个字段会被导入功能自动填充，如果传入该字段，会和原始字段自动合并，请谨慎处理 */
      nodeSize?: { height: number; width: number };
    };
    /**这个节点或线的属性面板数据 */
    form?: Partial<Forms>;
    /**如果是嵌套节点，需要给出子项节点id数组 */
    children?: string[];
  } | void;
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
export interface FixedNodeConfig extends NodeConfig {
  children?: string[];
  properties: {
    /**本节点的大小数据 */
    nodeSize: {
      width: number;
      height: number;
    };
  } & {
    [x in string]: any;
  };
}

export interface fixedGraphConfigData {
  nodes: FixedNodeConfig[];
  edges: EdgeConfig[];
}
