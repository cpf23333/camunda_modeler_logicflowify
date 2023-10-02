import { EdgeConfig, GraphConfigData, NodeConfig } from "@logicflow/core";
import { cloneDeep, isPlainObject, merge } from "lodash-es";
import { Logicflow } from "../class/index";
import { edgeTagNames, knownNonNodeOrEdgeNames } from "../config";
import { allNodes, taggedNodes } from "../nodes";
import { FixedNodeConfig, nodeDefinition } from "../types";
import { getBpmnId, xml2Json, xmlJsonAddTagData } from "../utils";
var tn = "\t\n";
let toXml = (obj: any, name: string, depth = 0): string => {
  var frontSpace = "  ".repeat(depth);
  var str = "";
  if (name === "#text") {
    return tn + frontSpace + obj;
  } else if (name === "#cdata-section") {
    return tn + frontSpace + "<![CDATA[" + obj + "]]>";
  } else if (name === "#comment") {
    return tn + frontSpace + "<!--" + obj + "-->";
  }
  if (("" + name).charAt(0) === "-") {
    return " " + name.substring(1) + '="' + obj + '"';
  } else {
    if (Array.isArray(obj)) {
      obj.forEach(function (item) {
        str += toXml(item, name, depth + 1);
      });
    } else if (Object.prototype.toString.call(obj) === "[object Object]") {
      let attrs = "";
      let content = "";
      str += (depth === 0 ? "" : tn + frontSpace) + "<" + name;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const val = obj[key];
          if (val === undefined || val === null) {
            continue;
          }
          if (key.startsWith("-")) {
            attrs += toXml(val, key, depth + 1);
          } else {
            content += toXml(val, key, depth + 1);
          }
        }
      }
      str +=
        attrs +
        (content !== ""
          ? ">" + content + (tn + frontSpace) + "</" + name + ">"
          : " />");
    } else {
      str +=
        tn +
        frontSpace +
        ("<" + name + ">" + obj.toString() + "</" + name + ">");
    }
  }
  return str;
};
/**将json转为xml */
export let json2Xml = (
  /**key为标签名称，val为标签的属性和内容 */
  json: Record<string, any>,
) => {
  let final = "";
  for (const key in json) {
    if (Object.prototype.hasOwnProperty.call(json, key)) {
      const val = json[key];
      if (val === undefined || val === null) {
        continue;
      }
      final += toXml(val, key, 0);
    }
  }
  return final;
};
let normalJson2XmlJson = (json: Record<string, any>) => {
  let obj: Record<string, any> = {};
  Object.entries((key: string, val: any) => {
    if (typeof val === "object") {
      if (Array.isArray(val)) {
        obj[key] = val.map((o) => normalJson2XmlJson(o));
      } else {
        obj[key] = normalJson2XmlJson(val);
      }
    } else {
      obj[key] = val;
    }
  });
  return obj;
};
let objectInit = (
  /**要进行初始化的对象 */
  initObj: Record<string, any>,
  /**要按顺序嵌套的键数组，函数执行完毕后，keys中非最后一项，值为对象，最后一项，值为lastVal */
  keys: string[],
  /**最后一个键的值 */
  lastVal: any,
) => {
  let rawObj = initObj;
  while (keys.length) {
    let key = keys.splice(0, 1)[0];
    if (!isPlainObject(initObj[key])) {
      if (!keys.length) {
        initObj[key] = lastVal;
      } else {
        initObj[key] = {};
        initObj = initObj[key];
      }
    }
  }
  return rawObj;
};
type processDataItem = {
  "-id": string;
  "-name"?: string;
} & { [x in string]: any };
let extractFromTag = (
  tagData: Record<string, Record<"-id", any> | Record<"-id", any>[]>,
  tagName: string,
  id: string,
  /**是否从原始数据中移除找到的标签数据 */
  spliceTagData = true,
) => {
  if (tagName in tagData) {
    let tag = tagData[tagName];
    if (tag instanceof Array) {
      let targetIndex = tag.findIndex((t) => t["-id"] === id);
      if (targetIndex != -1) {
        let target = tag.slice(targetIndex)[0];
        if (spliceTagData) {
          tag.splice(targetIndex, 1);
        }
        if (tag.length === 0 && spliceTagData) {
          delete tagData[tagName];
        }
        return target;
      }
    } else {
      if (tag["-id"] === id) {
        if (spliceTagData) {
          delete tagData[tagName];
        }

        return tag;
      }
    }
  }
  throw new Error("未找到目标标签");
};

let transNodeAndEdge = ({
  data,
  lf,
}: {
  data: GraphConfigData;
  lf: Logicflow;
}) => {
  let rawData = cloneDeep(data);
  let nodeMap = new Map<string, processDataItem>();
  let bpmnDi: {
    "bpmndi:BPMNShape": any[];
    "bpmndi:BPMNEdge": any[];
  } = {
    "bpmndi:BPMNShape": [],
    "bpmndi:BPMNEdge": [],
  };
  let processData: Record<string, Array<processDataItem> | processDataItem> =
    {};
  for (let i = 0; i < data.nodes.length; i++) {
    const node = data.nodes[i];
    if (node.id) {
      let targetNodeDefinition = allNodes[node.type];
      let type = targetNodeDefinition.topTag || node.type;
      let targetModel = lf.getModelById(node.id);
      /**节点的数据xml */
      let tagData: processDataItem = { "-id": node.id };
      /**节点的形状xml */
      let tagShapeData: Record<string, any> = {
        "-id": `${node.id}_di`,
        "-bpmnElement": node.id,
        "dc:Bounds": {
          "-x": node.x,
          "-y": node.y,
          "-width": targetModel.width,
          "-height": targetModel.height,
        },
      };
      let form = lf.getForm(node.id)[0];

      if (typeof node.text === "object") {
        tagShapeData["bpmndi:BPMNLabel"] = {
          "dc:Bounds": {
            "-x": node.text.x - (node.text.value.length * 10) / 2,
            "-y": node.text.y - 7,
            "-width": node.text.value.length * 10,
            "-height": 14,
          },
        };
        tagData["-name"] = node.text.value;
      }
      if (targetNodeDefinition && targetNodeDefinition.adapterOut) {
        let { tag, shape } = targetNodeDefinition.adapterOut({
          currentModel: targetModel,
          lf: lf,
          form: Object(lf.getForm(node.id)[0]),
          rootShapes: tagShapeData,
          rootTags: tagData,
        });

        merge(tagData, tag || {});
        merge(tagShapeData, shape || {});
      } else {
        let props = targetModel.getProperties();
        merge(tagData, props);
      }
      if (form.generalData.document) {
        tagData["bpmn:documentation"] = form.generalData.document;
      }
      let extensionElements = form.extensionElements.map((e) => {
        return {
          "-name": e.name,
          "-value": e.value,
        };
      });
      objectInit(
        tagData,
        ["bpmn:extensionElements", "zeebe:properties", "zeebe:property"],
        [],
      );
      let props: typeof extensionElements =
        tagData["bpmn:extensionElements"]["zeebe:properties"]["zeebe:property"];
      props.unshift(...extensionElements);
      bpmnDi["bpmndi:BPMNShape"].push(tagShapeData);
      nodeMap.set(node.id, tagData);
      xmlJsonAddTagData(processData, type, tagData);
    } else {
      console.error(`警告：`, node, "没有id");
    }
  }
  for (let i = 0; i < data.edges.length; i++) {
    const edge = data.edges[i];
    const targetNode = nodeMap.get(edge.targetNodeId);
    if (targetNode && edge.type && edge.id) {
      let targetEdgeDefinition = allNodes[edge.type];

      if (!targetNode["bpmn:incoming"]) {
        targetNode["bpmn:incoming"] = edge.id;
      } else if (Array.isArray(targetNode["bpmn:incoming"])) {
        targetNode["bpmn:incoming"].push(edge.id);
      } else {
        targetNode["bpmn:incoming"] = [targetNode["bpmn:incoming"], edge.id];
      }
      const pointsList = (edge.pointsList || []).map(({ x, y }) => ({
        "-x": x,
        "-y": y,
      }));
      const edgeTagData: processDataItem = {
        "-id": edge.id,
        "-sourceRef": edge.sourceNodeId,
        "-targetRef": edge.targetNodeId,
      };
      if (typeof edge.text === "object" && edge.text?.value) {
        edgeTagData["-name"] = edge.text?.value;
      }
      const edgeShapeData: Record<string, any> = {
        "-id": `${edge.id}_di`,
        "-bpmnElement": edge.id,
        "di:waypoint": pointsList,
      };
      if (typeof edge.text === "object" && edge.text?.value) {
        edgeShapeData["bpmndi:BPMNLabel"] = {
          "dc:Bounds": {
            "-x": edge.text.x - (edge.text.value.length * 10) / 2,
            "-y": edge.text.y - 7,
            "-width": edge.text.value.length * 10,
            "-height": 14,
          },
        };
      }
      let form = lf.getForm(edge.id)[0];

      if (targetEdgeDefinition && targetEdgeDefinition.adapterOut) {
        let { tag, shape } = targetEdgeDefinition.adapterOut({
          currentModel: lf.getEdgeModelById(edge.id),
          lf,
          form: form,
          rootTags: edgeTagData,
          rootShapes: edgeShapeData,
        });
        merge(edgeTagData, tag || {});
        merge(edgeShapeData, shape || {});
      }
      if (form.generalData.document) {
        edgeTagData["bpmn:documentation"] = form.generalData.document;
      }
      let extensionElements = form.extensionElements.map((e) => {
        return {
          "-name": e.name,
          "-value": e.value,
        };
      });

      objectInit(
        edgeTagData,
        ["bpmn:extensionElements", "zeebe:properties", "zeebe:property"],
        [],
      );
      let props: typeof extensionElements =
        edgeTagData["bpmn:extensionElements"]["zeebe:properties"][
          "zeebe:property"
        ];
      props.unshift(...extensionElements);
      if (processData[edge.type]) {
        if (processData[edge.type] instanceof Array) {
          processData[edge.type].push(edgeTagData);
        } else {
          let first = processData[edge.type] as processDataItem;
          processData[edge.type] = [first, edgeTagData];
        }
      } else {
        processData[edge.type] = edgeTagData;
      }

      bpmnDi["bpmndi:BPMNEdge"].push(edgeShapeData);
      // 下部逻辑来自logicflow源码
      // @see https://github.com/didi/LogicFlow/issues/325
      // 需要保证incoming在outgoing之前
      const sourceNode = nodeMap.get(edge.sourceNodeId);
      if (sourceNode) {
        if (!sourceNode["bpmn:outgoing"]) {
          sourceNode["bpmn:outgoing"] = edge.id;
        } else if (Array.isArray(sourceNode["bpmn:outgoing"])) {
          sourceNode["bpmn:outgoing"].push(edge.id);
        } else {
          // 字符串转数组
          sourceNode["bpmn:outgoing"] = [sourceNode["bpmn:outgoing"], edge.id];
        }
      }
    }
  }
  let subprocessNodes = rawData.nodes.filter(
    (o) => "children" in o,
  ) as (NodeConfig & { children: string[]; id: string })[];
  let topSubprocessNodes = [];
  for (let i = 0; i < subprocessNodes.length; i++) {
    const node = subprocessNodes[i];
    if (subprocessNodes.every((o) => !o.children.includes(node.id))) {
      topSubprocessNodes.push(node);
    }
  }
  let toHierarchicalNodes = (node: NodeConfig) => {
    if (
      "children" in node &&
      node.children instanceof Array &&
      node.children.length
    ) {
      if (!node.id) {
        return;
      }
      let edgeIds: Set<string> = new Set();
      let nodeDef = allNodes[lf.getModelById(node.id).type];
      let nodeTagName = nodeDef.topTag || nodeDef.type;
      let nodeTag = extractFromTag(processData, nodeTagName, node.id, false);
      node.children.forEach((childNodeId) => {
        lf.getNodeIncomingEdge(childNodeId).forEach((edge) => {
          edgeIds.add(edge.id);
        });
        lf.getNodeOutgoingEdge(childNodeId).forEach((edge) => {
          edgeIds.add(edge.id);
        });
        let childModel = lf.getModelById(childNodeId);
        let targetDef = allNodes[childModel.type];
        let childTagName = targetDef.topTag || targetDef.type;
        let childIsGroup = childTagName === "bpmn:subProcess";
        if (childIsGroup) {
          toHierarchicalNodes(lf.getNodeDataById(childNodeId));
        }
        let childNode = extractFromTag(processData, childTagName, childNodeId);
        xmlJsonAddTagData(nodeTag, childTagName, childNode);
      });
      console.log(Array.from(edgeIds));
      edgeIds.forEach((edgeId) => {
        let edgeModel = lf.getModelById(edgeId);
        let edgeDef = allNodes[edgeModel.type];
        let edgeTagName = edgeDef.topTag || edgeDef.type;
        let edgeData = extractFromTag(processData, edgeTagName, edgeId);
        xmlJsonAddTagData(nodeTag, edgeTagName, edgeData);
      });
    }
  };
  while (topSubprocessNodes.length) {
    let node = topSubprocessNodes.splice(0, 1)[0];
    toHierarchicalNodes(node);
  }
  return { processData, bpmnDi };
};
export let getGraphConfigData = ({
  tagDatas,
  plane,
  lf,
}: {
  tagDatas: Record<string, any>;
  plane: { "bpmndi:BPMNShape": any[]; "bpmndi:BPMNEdge": any[] };
  lf: Logicflow;
}) => {
  let g: GraphConfigData = {
    edges: [],
    nodes: [],
  };
  for (const tagName in tagDatas) {
    if (tagName.startsWith("-") || knownNonNodeOrEdgeNames.includes(tagName)) {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(tagDatas, tagName)) {
      let isEdge = edgeTagNames.includes(tagName);
      let datas = tagDatas[tagName];
      if (!(datas instanceof Array)) {
        datas = [datas];
      }
      if (isEdge) {
        datas.forEach((edgeData: { [x: string]: any }) => {
          let newEdge = getEdgeConfig({
            diData: plane["bpmndi:BPMNEdge"].find(
              (o) => o["-bpmnElement"] === edgeData["-id"],
            ),
            lf,
            tagData: edgeData,
            type: tagName,
            plane,
            graphConfigData: g,
          });
          g.edges.push(newEdge);
        });
      } else {
        datas.forEach((nodeData: { [x: string]: any }) => {
          let newNode = getNodeConfig({
            diData: plane["bpmndi:BPMNShape"].find(
              (o) => o["-bpmnElement"] === nodeData["-id"],
            ),
            lf,
            tagName: tagName,
            tagData: nodeData,
            plane,
            graphConfigData: g,
          });
          g.nodes.push(newNode);
        });
      }
    }
  }
  return g;
};
/**
 * 将bpmn数据转换为LogicFlow内部能识别数据
 */
function convertBpmn2LfData(
  bpmnData: Record<string, any>,
  lf: Logicflow,
): GraphConfigData {
  let g: GraphConfigData = {
    nodes: [],
    edges: [],
  };
  const definitions = bpmnData["bpmn:definitions"];
  if (definitions) {
    const process = definitions["bpmn:process"];
    const plane: {
      "bpmndi:BPMNShape": any[];
      "bpmndi:BPMNEdge": any[];
    } = definitions["bpmndi:BPMNDiagram"]["bpmndi:BPMNPlane"];
    if (plane["bpmndi:BPMNEdge"]) {
      if (!(plane["bpmndi:BPMNEdge"] instanceof Array)) {
        plane["bpmndi:BPMNEdge"] = [plane["bpmndi:BPMNEdge"]];
      }
    }
    if (plane["bpmndi:BPMNShape"]) {
      if (!(plane["bpmndi:BPMNShape"] instanceof Array)) {
        plane["bpmndi:BPMNShape"] = [plane["bpmndi:BPMNShape"]];
      }
    }
    g = getGraphConfigData({
      tagDatas: process,
      lf: lf,
      plane: plane,
    });
  }
  return g;
}
let initNodeOrEdgeForm = ({
  tagData,
  lf,
  nodeDefinition,
  diData,
  plane,
  graphConfigData,
}: {
  tagData: Record<string, any>;
  diData: Record<string, any>;
  lf: Logicflow;
  nodeDefinition?: nodeDefinition;
  /**bpmndi:BPMNPlane标签，可以通过这个读取所有节点的形状数据 */
  plane: {
    "bpmndi:BPMNShape": any[];
    "bpmndi:BPMNEdge": any[];
  };
  graphConfigData: GraphConfigData;
}) => {
  let id = tagData["-id"];
  let documentTxt =
    typeof tagData["bpmn:documentation"]?.["#text"] === "string"
      ? tagData["bpmn:documentation"]["#text"]
      : "";
  let finalForm = {
    generalData: {
      id: id,
      name: tagData["-name"] || "",
      document: documentTxt,
    },
  };
  let inRes =
    nodeDefinition && nodeDefinition.adapterIn
      ? nodeDefinition.adapterIn({
          lf,
          shape: diData,
          tag: tagData,
          plane,
          graphConfigData: graphConfigData,
        })
      : null;

  if (inRes?.form) {
    merge(finalForm, inRes.form);
  }
  setTimeout(() => {
    lf.initForm(id, finalForm);
  }, 0);
  return inRes;
};
export function getNodeConfig({
  diData,
  tagName,
  tagData,
  lf,
  plane,
  graphConfigData,
}: {
  /**该节点对应的形状 */
  diData: any;
  tagName: any;
  /**标签内容 */
  tagData: any;
  lf: Logicflow;
  /**bpmndi:BPMNPlane标签，可以通过这个读取所有节点的形状数据 */
  plane: {
    "bpmndi:BPMNShape": any[];
    "bpmndi:BPMNEdge": any[];
  };
  graphConfigData: GraphConfigData;
}) {
  let x = Number(diData["dc:Bounds"]["-x"]);
  let y = Number(diData["dc:Bounds"]["-y"]);
  let width = Number(diData["dc:Bounds"]["-width"]);
  let height = Number(diData["dc:Bounds"]["-height"]);

  const name = tagData["-name"];
  // const shapeConfig = BpmnAdapter.shapeConfigMap.get(type);
  // if (shapeConfig) {
  //   x += shapeConfig.width / 2;
  //   y += shapeConfig.height / 2;
  // }
  let targetNodeDefinition = getTargetDefinition({
    type: tagName,
    lf,
    json: tagData,
  });
  let inRes = initNodeOrEdgeForm({
    tagData: tagData,
    lf,
    nodeDefinition: targetNodeDefinition,
    diData: diData,
    plane,
    graphConfigData,
  });

  let text;
  if (name) {
    text = {
      x,
      y,
      value: name,
    };
    // 自定义文本位置
    if (diData["bpmndi:BPMNLabel"] && diData["bpmndi:BPMNLabel"]["dc:Bounds"]) {
      const textBounds = diData["bpmndi:BPMNLabel"]["dc:Bounds"];
      text.x = Number(textBounds["-x"]) + Number(textBounds["-width"]) / 2;
      text.y = Number(textBounds["-y"]) + Number(textBounds["-height"]) / 2;
    }
  }
  const nodeConfig: FixedNodeConfig = {
    id: diData["-bpmnElement"],
    type: tagName,
    x,
    y,
    properties: merge(
      {
        nodeSize: {
          height,
          width,
        },
      },
      inRes?.properties || {},
    ),
    children: inRes?.children,
  };
  if (text) {
    nodeConfig.text = text;
  }
  return nodeConfig;
}

let getTargetDefinition = ({
  type,
  lf,
  json,
}: {
  type: string;
  lf: Logicflow;
  json: Record<string, any>;
}) => {
  let arr = taggedNodes[type];
  if (arr) {
    if (arr.length === 1) {
      return arr[0];
    } else {
      let target = arr.find((def) => {
        if (def.isCurrentNode) {
          return def.isCurrentNode({ lf, json });
        }
      });
      return target;
    }
  }
};

export function getEdgeConfig({
  diData,
  tagData,
  lf,
  type,
  plane,

  graphConfigData,
}: {
  diData: any;
  tagData: any;
  lf: Logicflow;
  /**标签名称 */
  type: string;
  /**bpmndi:BPMNPlane标签，可以通过这个读取所有节点的形状数据 */
  plane: {
    "bpmndi:BPMNShape": any[];
    "bpmndi:BPMNEdge": any[];
  };
  graphConfigData: GraphConfigData;
}) {
  let text;
  const textVal: string = tagData["-name"];
  if (textVal) {
    const textBounds = diData["bpmndi:BPMNLabel"]["dc:Bounds"];
    // 如果边文本换行，则其偏移量应该是最长一行的位置
    let textLength = 0;
    textVal.split("\n").forEach((textSpan) => {
      if (textLength < textSpan.length) {
        textLength = textSpan.length;
      }
    });

    text = {
      value: textVal,
      x: Number(textBounds["-x"]) + (textLength * 10) / 2,
      y: Number(textBounds["-y"]) + 7,
    };
  }
  let targetEdgeDefinition = getTargetDefinition({
    type,
    lf,
    json: tagData,
  });

  let inRes = initNodeOrEdgeForm({
    tagData: tagData,
    lf,
    nodeDefinition: targetEdgeDefinition,
    diData: diData,
    plane,
    graphConfigData,
  });
  const edge: EdgeConfig = {
    id: tagData["-id"],
    type: edgeTagNames[0],
    pointsList: diData["di:waypoint"].map((point: { [x: string]: any }) => ({
      x: Number(point["-x"]),
      y: Number(point["-y"]),
    })),
    sourceNodeId: tagData["-sourceRef"],
    targetNodeId: tagData["-targetRef"],
    properties: inRes?.properties,
  };
  if (text) {
    edge.text = text;
  }
  return edge;
}
/**
 * logicFlow导入导出bpmn插件
 */
export class Adapter {
  static pluginName = "bpmn-adapter";
  lf: Logicflow;
  constructor({ lf }: { lf: Logicflow }) {
    lf.adapterOut = (data) => this.adapterOut(data);
    lf.adapterIn = (xmlContent) => {
      if (JSON.stringify(xmlContent) === "{}") {
        return this.adapterIn("");
      }
      if (typeof xmlContent === "string") {
        return this.adapterIn(xmlContent);
      }
      throw new Error("数据错误");
    };
    this.lf = lf;
  }
  adapterOut(data: GraphConfigData) {
    let transedData = transNodeAndEdge({ data, lf: this.lf });
    let processData = {
      "-isExecutable": "true",
      "-id": `Process_${getBpmnId()}`,
      ...transedData.processData,
    };
    let xml = {
      "bpmn:definitions": {
        "-id": `Definitions_${getBpmnId()}`,
        "-xmlns:bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
        "-xmlns:bpmndi": "http://www.omg.org/spec/BPMN/20100524/DI",
        "-xmlns:dc": "http://www.omg.org/spec/DD/20100524/DC",
        "-xmlns:di": "http://www.omg.org/spec/DD/20100524/DI",
        "-xmlns:zeebe": "http://camunda.org/schema/zeebe/1.0",
        "-xmlns:modeler": "http://camunda.org/schema/modeler/1.0",
        "-targetNamespace": "http://bpmn.io/schema/bpmn",
        /**@see  {@link{https://forum.bpmn.io/t/how-to-add-color-to-bpmn-diagram-for-dynamic-xml/5269#:~:text=DD/20100524/DC%22-,xmlns%3Abioc,-%3D%22http%3A//bpmn}} */
        "-xmlns:bioc": "http://bpmn.io/schema/bpmn/biocolor/1.0",
        // 上面讨论中没有提及，这里先使用和bioc一样的链接
        "-xmlns:color": "http://bpmn.io/schema/bpmn/biocolor/1.0",
        "-exporter": "logicflow",
        "-exporterVersion": "1.2.0",
        "-modeler:executionPlatform": "Camunda Cloud",
        "-modeler:executionPlatformVersion": "8.2.0",
        "bpmn:process": processData,
        "bpmndi:BPMNDiagram": {
          "-id": "BPMNDiagram_1",
          "bpmndi:BPMNPlane": {
            "-id": "BPMNPlane_1",
            "-bpmnElement": processData["-id"],
            ...transedData.bpmnDi,
          },
        },
      },
    };
    let txt = `<?xml version="1.0" encoding="UTF-8"?>\r\n` + json2Xml(xml);
    return txt;
  }
  adapterIn(xmlContent: string) {
    if (xmlContent) {
      let xmlJson = xml2Json(xmlContent);
      let res = convertBpmn2LfData(xmlJson, this.lf);
      return res;
    }
    return {
      nodes: [],
      edges: [],
    };
  }
}
