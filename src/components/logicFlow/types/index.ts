import {
  BaseEdge,
  BaseEdgeModel,
  BaseNode,
  BaseNodeModel,
} from "@logicflow/core";
import { JSX } from "solid-js/jsx-runtime";
import { Forms, Logicflow } from "../class";
import { createStore } from "solid-js/store";
type initParams = {
  lf: Logicflow;
  model: BaseNodeModel | BaseEdgeModel;
};
export type BaseModel = BaseNodeModel | BaseEdgeModel;
type checkCurrentOrInitParams = {
  /**这个节点的json数据 */
  json: Record<string, any>;
  lf: Logicflow;
};
export type renderParams = {
  /**当前选中的节点或线 */
  currentModel: BaseEdgeModel | BaseNodeModel;
  lf: Logicflow;
};

/**bpmn节点定义 */
export interface nodeDefinition {
  /**用户可以看到的节点类型名称 */
  name: string;
  /**svg图标 */
  icon: string;
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
  topType?: string;
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
  ) => ReturnType<typeof createStore<Forms<any, any, any, any>>>;
  modelRenderConfig?: {
    /**是否有通用块(编辑名称和id) 默认为true */
    general: boolean;
    /**是否存在文档块，默认为true */
    documation: boolean;
    /**是否存在拓展属性，默认为true */
    extensionProperties: boolean;
  };
  /**右侧属性面板的渲染函数 */
  modelRender?: (params: renderParams) => JSX.Element;
  /**传入json数据，返回是否为当前节点 */
  isCurrentNode?: (params: checkCurrentOrInitParams) => boolean | void;
  /**若isCurrentNode返回值为true，则会调用这个函数 */
  adapterIn?: (params: checkCurrentOrInitParams) => Record<string, any> | void;
  /**将该节点实例导出为json */
  adapterOut?: (params: renderParams) => Record<string, any>;
}
