import { EdgeConfig, GraphConfigData, NodeConfig } from "@logicflow/core";
import { lfJson2Xml, toNormalJson } from "@logicflow/extension";
import { isPlainObject, merge } from "lodash-es";
import { Logicflow } from "../class/index";
import { edgeTypes } from "../config";
import { allNodes, taggedNodes } from "../nodes";
import { nodeDefinition } from "../types";
import { getBpmnId, xml2Json } from "../utils";
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
let transNodeAndEdge = ({
  data,
  lf,
}: {
  data: GraphConfigData;
  lf: Logicflow;
}) => {
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
      /**节点的平面xml */
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
        });
        merge(tagData, tag);
        merge(tagShapeData, shape);
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
      if (processData[type]) {
        if (processData[type] instanceof Array) {
          processData[type].push(tagData);
        } else {
          let first = processData[type] as processDataItem;
          processData[type] = [first, tagData];
        }
      } else {
        processData[type] = tagData;
      }
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
        });
        merge(edgeTagData, tag);
        merge(edgeShapeData, shape);
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

  return { processData, bpmnDi };
};
/**
 * 将bpmn数据转换为LogicFlow内部能识别数据
 */
function convertBpmn2LfData(
  bpmnData: Record<string, any>,
  lf: Logicflow,
): GraphConfigData {
  let nodes: NodeConfig[] = [];
  let edges: EdgeConfig[] = [];
  const definitions = bpmnData["bpmn:definitions"];
  if (definitions) {
    const process = definitions["bpmn:process"];
    Object.keys(process).forEach((key) => {
      if (key.indexOf("bpmn:") === 0) {
        const value = process[key];
        if (edgeTypes.includes(key as unknown as (typeof edgeTypes)[number])) {
          const bpmnEdges =
            definitions["bpmndi:BPMNDiagram"]["bpmndi:BPMNPlane"][
              "bpmndi:BPMNEdge"
            ];
          edges = getLfEdges({ value, bpmnEdges, key, lf });
        } else {
          const shapes =
            definitions["bpmndi:BPMNDiagram"]["bpmndi:BPMNPlane"][
              "bpmndi:BPMNShape"
            ];
          nodes = nodes.concat(getLfNodes({ value, shapes, key, lf }));
        }
      }
    });
  }
  return {
    nodes,
    edges,
  };
}
function getLfNodes({
  value,
  shapes,
  key,
  lf,
}: {
  value: any;
  shapes: any;
  key: string;
  lf: Logicflow;
}) {
  const nodes = [];
  if (Array.isArray(value)) {
    // 数组
    value.forEach((val) => {
      let shapeValue;
      if (Array.isArray(shapes)) {
        shapeValue = shapes.find(
          (shape) => shape["-bpmnElement"] === val["-id"],
        );
      } else {
        shapeValue = shapes;
      }
      const node = getNodeConfig({
        shapeValue,
        type: key,
        processValue: val,
        lf,
      });
      nodes.push(node);
    });
  } else {
    let shapeValue;
    if (Array.isArray(shapes)) {
      shapeValue = shapes.find(
        (shape) => shape["-bpmnElement"] === value["-id"],
      );
    } else {
      shapeValue = shapes;
    }
    const node = getNodeConfig({
      shapeValue,
      type: key,
      processValue: value,
      lf,
    });
    nodes.push(node);
  }
  return nodes;
}
let initNodeOrEdgeForm = ({
  processValue,
  lf,
  nodeDefinition,
}: {
  processValue: Record<string, any>;
  lf: Logicflow;
  nodeDefinition?: nodeDefinition;
}) => {
  console.log("processValue", processValue);

  setTimeout(() => {
    let id = processValue["-id"];
    let documentTxt =
      typeof processValue["bpmn:documentation"]?.["#text"] === "string"
        ? processValue["bpmn:documentation"]["#text"]
        : "";
    lf.initForm(
      id,
      {
        generalData: {
          id: id,
          name: processValue["-name"],
          document: documentTxt,
        },
      },
      { nodeDefinition: nodeDefinition },
    );
  }, 50);
};
const defaultAttrs = [
  "-name",
  "-id",
  "bpmn:incoming",
  "bpmn:outgoing",
  "-sourceRef",
  "-targetRef",
];
function getNodeConfig({
  shapeValue,
  type,
  processValue,
  lf,
}: {
  shapeValue: any;
  type: any;
  processValue: any;
  lf: Logicflow;
}) {
  let x = Number(shapeValue["dc:Bounds"]["-x"]);
  let y = Number(shapeValue["dc:Bounds"]["-y"]);
  const name = processValue["-name"];
  // const shapeConfig = BpmnAdapter.shapeConfigMap.get(type);
  // if (shapeConfig) {
  //   x += shapeConfig.width / 2;
  //   y += shapeConfig.height / 2;
  // }
  let properties: Record<string, any> | undefined = undefined;
  // 判断是否存在额外的属性，将额外的属性放到properties中
  Object.entries(processValue).forEach(([key, value]) => {
    if (defaultAttrs.indexOf(key) === -1) {
      if (!properties) properties = {};
      properties[key] = value;
    }
  });
  if (properties) {
    properties = toNormalJson(properties);
  }
  let targetNodeDefinition = getTargetDefinition({
    type,
    lf,
    json: processValue,
  });
  if (targetNodeDefinition) {
    if (targetNodeDefinition.adapterIn) {
      let addOnProps = targetNodeDefinition.adapterIn({
        lf,
        shape: shapeValue,
        tag: processValue,
      });
      if (addOnProps) {
        merge(properties, addOnProps);
      }
    }
  }

  initNodeOrEdgeForm({
    processValue,
    lf,
    nodeDefinition: targetNodeDefinition,
  });
  let text;
  if (name) {
    text = {
      x,
      y,
      value: name,
    };
    // 自定义文本位置
    if (
      shapeValue["bpmndi:BPMNLabel"] &&
      shapeValue["bpmndi:BPMNLabel"]["dc:Bounds"]
    ) {
      const textBounds = shapeValue["bpmndi:BPMNLabel"]["dc:Bounds"];
      text.x = Number(textBounds["-x"]) + Number(textBounds["-width"]) / 2;
      text.y = Number(textBounds["-y"]) + Number(textBounds["-height"]) / 2;
    }
  }
  const nodeConfig: NodeConfig = {
    id: shapeValue["-bpmnElement"],
    type,
    x,
    y,
    properties: properties || undefined,
  };
  if (text) {
    nodeConfig.text = text;
  }
  return nodeConfig;
}

function getLfEdges({
  value,
  bpmnEdges,
  lf,
  key,
}: {
  value: any;
  bpmnEdges: any;
  lf: Logicflow;
  key: string;
}) {
  const edges = [];
  if (Array.isArray(value)) {
    value.forEach((val) => {
      let edgeValue;
      if (Array.isArray(bpmnEdges)) {
        edgeValue = bpmnEdges.find(
          (edge) => edge["-bpmnElement"] === val["-id"],
        );
      } else {
        edgeValue = bpmnEdges;
      }
      edges.push(
        getEdgeConfig({ edgeValue, processValue: val, lf, type: key }),
      );
    });
  } else {
    let edgeValue;
    if (Array.isArray(bpmnEdges)) {
      edgeValue = bpmnEdges.find(
        (edge) => edge["-bpmnElement"] === value["-id"],
      );
    } else {
      edgeValue = bpmnEdges;
    }
    edges.push(
      getEdgeConfig({ edgeValue, processValue: value, lf, type: key }),
    );
  }
  return edges;
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

function getEdgeConfig({
  edgeValue,
  processValue,
  lf,
  type,
}: {
  edgeValue: any;
  processValue: any;
  lf: Logicflow;
  /**标签名称 */
  type: string;
}) {
  let text;
  const textVal: string = processValue["-name"];
  if (textVal) {
    const textBounds = edgeValue["bpmndi:BPMNLabel"]["dc:Bounds"];
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
  let properties: Record<string, any> | undefined;
  // 判断是否存在额外的属性，将额外的属性放到properties中
  Object.entries(processValue).forEach(([key, value]) => {
    if (defaultAttrs.indexOf(key) === -1) {
      if (!properties) properties = {};
      properties[key] = value;
    }
  });
  if (properties) {
    properties = toNormalJson(properties);
  }
  let targetEdgeDefinition = getTargetDefinition({
    type,
    lf,
    json: processValue,
  });
  if (targetEdgeDefinition) {
    if (targetEdgeDefinition.adapterIn) {
      let addOnProps = targetEdgeDefinition.adapterIn({
        lf,
        shape: edgeValue,
        tag: processValue,
      });
      if (addOnProps) {
        merge(properties, addOnProps);
      }
    }
  }
  initNodeOrEdgeForm({
    processValue,
    lf,
    nodeDefinition: targetEdgeDefinition,
  });
  const edge: EdgeConfig = {
    id: processValue["-id"],
    type: edgeTypes[0],
    pointsList: edgeValue["di:waypoint"].map((point: { [x: string]: any }) => ({
      x: Number(point["-x"]),
      y: Number(point["-y"]),
    })),
    sourceNodeId: processValue["-sourceRef"],
    targetNodeId: processValue["-targetRef"],
    properties,
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
    let txt = `<?xml version="1.0" encoding="UTF-8"?>\r\n` + lfJson2Xml(xml);
    return txt;
  }
  adapterIn(xmlContent: string) {
    if (xmlContent) {
      let xmlJson = xml2Json(xmlContent);

      return convertBpmn2LfData(xmlJson, this.lf);
    }
    return {
      nodes: [],
      edges: [],
    };
  }
}
