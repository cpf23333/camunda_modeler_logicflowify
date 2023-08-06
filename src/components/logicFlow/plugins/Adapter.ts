import { GraphConfigData } from "@logicflow/core";
import { lfJson2Xml, lfXml2Json } from "@logicflow/extension";
import { isPlainObject, merge } from "lodash-es";
import { Logicflow } from "../class/index";
import { allNodes } from "../nodes";
import { getBpmnId } from "../utils";
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
      let type = targetNodeDefinition.topType || node.type;
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
 * logicFlow导入导出bpmn插件
 */
export class Adapter {
  static pluginName = "bpmn-adapter";
  lf: Logicflow;

  constructor({ lf }: { lf: Logicflow }) {
    lf.adapterOut = (data) => this.adapterOut(data);
    lf.adapterIn = (...rest) => this.adapterIn(...rest);
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
        "-xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "-xmlns:bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
        "-xmlns:bpmndi": "http://www.omg.org/spec/BPMN/20100524/DI",
        "-xmlns:dc": "http://www.omg.org/spec/DD/20100524/DC",
        "-xmlns:di": "http://www.omg.org/spec/DD/20100524/DI",
        "-targetNamespace": "http://logic-flow.org",
        "-exporter": "logicflow",
        "-exporterVersion": "1.2.0",
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
    console.log(txt);
    return txt;
  }
  adapterIn(xml: any) {
    let json = lfXml2Json(xml);
    return { nodes: [], edges: [] };
  }
}
