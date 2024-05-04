import { Definition, LogicFlow as oldLogicFlow } from "@logicflow/core";
import ElkConstructor, { ElkNode } from "elkjs";
import { cloneDeep, merge } from "lodash-es";
import { createStore } from "solid-js/store";
import { reactifyObject } from "solidjs-use";
import { allNodes } from "../nodes";
import { fixedGraphConfigData } from "../types";
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
/**已知的与process标签同级的标签 */
export let addonTags = ["bpmn:message"] as const;
type AddOnTagType = (typeof addonTags)[number];
type BaseTagData = {
  id: string;
  name?: string;
} & { [x in string]: any };
export interface MessageTagData extends BaseTagData {
  correlationKey?: string;
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
class AddonTagStore {
  adapter: Record<
    AddOnTagType,
    {
      adapterIn(data: any[]): void;
      adapterOut(): any[];
    }
  >;
  #store = reactifyObject<Record<AddOnTagType, BaseTagData[]>>({
    "bpmn:message": [],
  });

  constructor() {
    this.adapter = {
      "bpmn:message": {
        adapterIn: (datas) => {
          datas.forEach((tagData) => {
            let msg: MessageTagData = {
              id: tagData["-id"],
              name: tagData["-name"],
            };
            let correlationKey =
              tagData["bpmn:extensionElements"]["zeebe:subscription"][
                "-correlationKey"
              ];
            msg.correlationKey = correlationKey;
            this.#store["bpmn:message"].push(msg);
          });
        },
        adapterOut: () => {
          let arr: Record<string, any>[] = [];
          this.#store["bpmn:message"].forEach((msg) => {
            let base: Record<string, any> = {
              "-id": msg.id,
              "-name": msg.name,
            };
            if ("correlationKey" in msg) {
              base["bpmn:extensionElements"] = {
                "zeebe:subscription": {
                  "-correlationKey": msg.correlationKey,
                },
              };
            }
            arr.push(base);
          });
          return arr;
        },
      },
    };
  }
  /**注意，获取到的标签是弱引用关系，对获取到的标签对象的修改会直接同步到类中 */
  getTag(tagName: AddOnTagType) {
    return this.#store[tagName];
  }
  /**设置一个message */
  setTag(tagName: "bpmn:message", data: BaseTagData): void;
  setTag(tagName: AddOnTagType, data: BaseTagData) {
    this.#store[tagName].push(data);
  }
  adapterOut() {
    let obj: Record<AddOnTagType, any[]> = {
      "bpmn:message": [],
    };
    Object.keys(this.#store).forEach((tagName) => {
      obj[tagName as AddOnTagType] =
        this.adapter[tagName as AddOnTagType].adapterOut();
    });
    return obj;
  }
  adapterIn(xmlJson: Record<string, any>) {
    let content = xmlJson["bpmn:definitions"];
    addonTags.forEach((tagName) => {
      if (tagName in content) {
        let data = content[tagName];
        if (!data) {
          return;
        }
        if (!Array.isArray(data)) {
          data = [data];
        }
        this.adapter[tagName].adapterIn(data);
      }
    });
  }
}

export class Logicflow extends oldLogicFlow {
  processId: string;
  globalTags = new AddonTagStore();
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
  /**排版 */
  async doLayout(_params?: {
    /**是否在排版错误时发出一个提示
     * @default false */
    noticeErr?: boolean;
  }) {
    let rawData = this.getGraphRawData() as unknown as fixedGraphConfigData;
    let clonedRawData = cloneDeep(rawData);
    let nodeIdMap: Record<string, (typeof rawData)["nodes"][number]> = {};
    let nodes = [];
    let edges = [];
    let topNodes = [];
    let edgeIdMap: Record<string, (typeof rawData)["edges"][number]> = {};
    rawData.nodes.forEach((node) => {
      nodeIdMap[node.id] = node;
    });
    /**
     * @type {Set<string>}
     */
    let settedEdgeId: Set<string> = new Set();
    rawData.edges.forEach((edge) => {
      edgeIdMap[edge.id] = edge;
    });
    /**
     * 如果一个id在这个对象里的话，说明这个节点不是最上层的，是在子流程内的节点
     */
    let childIdMap: Record<string, true> = {};
    rawData.nodes.forEach((node) => {
      if (node.children) {
        node.children.forEach((child) => {
          childIdMap[child] = true;
        });
      }
    });
    for (let i = 0; i < rawData.nodes.length; i++) {
      const node = rawData.nodes[i];
      if (node.children && !(node.id in childIdMap)) {
        topNodes.push(node);
        rawData.nodes.splice(i, 1);
        i -= 1;
      }
    }
    /**
     *
     * @param {rawData["edges"][number]} edge
     */
    let getEdge = (edge: (typeof rawData)["edges"][number]) => {
      let obj = {
        id: edge.id,
        sources: [edge.sourceNodeId],
        targets: [edge.targetNodeId],
      };
      return obj;
    };
    let getNode = (node: (typeof rawData)["nodes"][number]) => {
      let obj: ElkNode = {
        id: node.id,
        height: node.properties.nodeSize.height,
        width: node.properties.nodeSize.width,
        x: node.x,
        y: node.y,
        labels: [],
        children: [],
        edges: [],
      };
      if (node.text) {
        if (typeof node.text == "string") {
          obj.labels!.push({
            text: node.text,
          });
        } else {
          obj.labels!.push({
            text: node.text.value,
            x: node.text.x,
            y: node.text.y,
          });
        }
      }
      if (node.children) {
        let childIds = node.children;
        childIds.forEach((childId) => {
          let childIdIndex = rawData.nodes.findIndex((o) => o.id === childId);
          if (childIdIndex !== -1) {
            let child = rawData.nodes.splice(childIdIndex, 1)[0];
            obj.children!.push(getNode(child));
          }
        });
        for (const key in edgeIdMap) {
          if (Object.hasOwnProperty.call(edgeIdMap, key)) {
            const edge = edgeIdMap[key];
            let startId = edge.sourceNodeId;
            let endId = edge.targetNodeId;
            if (
              !settedEdgeId.has(edge.id) &&
              childIds.includes(startId) &&
              childIds.includes(endId)
            ) {
              // 这条线是在本层级的
              obj.edges!.push(getEdge(edge));
              settedEdgeId.add(edge.id);
            }
          }
        }
      }
      return obj;
    };
    topNodes.forEach((node) => {
      nodes.push(getNode(node));
    });
    while (rawData.nodes.length) {
      let node = rawData.nodes.splice(0, 1)[0];
      nodes.push(getNode(node));
    }
    for (const key in edgeIdMap) {
      if (Object.hasOwnProperty.call(edgeIdMap, key)) {
        if (!settedEdgeId.has(key)) {
          const edge = edgeIdMap[key];
          edges.push(getEdge(edge));
        }
      }
    }
    let graph = {
      id: "root",
      children: nodes,
      edges,
    };

    let elkIns = new ElkConstructor();
    let res = await elkIns.layout(graph);
    clonedRawData.nodes.forEach((node) => {
      nodeIdMap[node.id] = node;
    });
    clonedRawData.edges.forEach((edge) => {
      edgeIdMap[edge.id] = edge;
    });
    res.children?.forEach((node) => {
      let rawNode = nodeIdMap[node.id];
      rawNode.x = (node.x || 0) + (node.width || 0);
      rawNode.y = (node.y || 0) + (node.height || 0);
      if (node.labels?.length) {
        let label = node.labels[0];
        if (typeof rawNode.text === "string") {
          rawNode.text = label.text || "";
        } else {
          rawNode.text = {
            id: label.id,
            value: label.text || "",
            x: label.x!,
            y: label.y!,
          };
        }
      }
    });
    res.edges?.forEach((edge) => {
      let rawEdge = edgeIdMap[edge.id];
      let sections = edge.sections!;
      let start = sections[0];
      let end = sections[sections.length - 1];
      let startNode = nodeIdMap[rawEdge.sourceNodeId];
      rawEdge.startPoint = {
        x: start.startPoint.x + startNode.properties.nodeSize.width / 2,
        y: start.startPoint.y + startNode.properties.nodeSize.height / 2,
      };
      let endNode = nodeIdMap[rawEdge.targetNodeId];
      rawEdge.endPoint = {
        x: end.endPoint.x + endNode.properties.nodeSize.width / 2,
        y: end.endPoint.y + endNode.properties.nodeSize.height / 2,
      };
      rawEdge.pointsList = [rawEdge.startPoint!, rawEdge.endPoint!];
    });
    console.log(clonedRawData, res, graph);

    this.renderRawData(clonedRawData);

    // console.log(elkIns);
  }
}
