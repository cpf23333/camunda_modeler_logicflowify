import { GraphConfigData, NodeConfig } from "@logicflow/core";
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
  let nodeMap = new Map<string, NodeConfig>();
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
      nodeMap.set(node.id, node);
      let targetNodeDefinition = allNodes[node.type];
      let type = targetNodeDefinition.topType || node.type;
      let targetModel = lf.getModelById(node.id);
      /**最终的数据xml */
      let finalTagData: processDataItem = { "-id": node.id };
      /**最终的平面xml */
      let finalshapeData: Record<string, any> = {
        "-id": `${node.id}_di`,
        "-bpmnElement": node.id,
        "dc:Bounds": {
          "-x": node.x,
          "-y": node.y,
          "-width": targetModel.width,
          "-height": targetModel.height,
        },
      };
      let forms = lf.getForm(node.id)[0];

      if (typeof node.text === "object") {
        finalshapeData["bpmndi:BPMNLabel"] = {
          "dc:Bounds": {
            "-x": node.text.x - (node.text.value.length * 10) / 2,
            "-y": node.text.y - 7,
            "-width": node.text.value.length * 10,
            "-height": 14,
          },
        };
        finalTagData["-name"] = node.text.value;
      }
      if (targetNodeDefinition && targetNodeDefinition.adapterOut) {
        let { tag, shape } = targetNodeDefinition.adapterOut({
          currentModel: targetModel,
          lf: lf,
          form: Object(lf.getForm(node.id)[0]),
        });
        merge(finalTagData, tag);
        merge(finalshapeData, shape);
      } else {
        let props = targetModel.getProperties();
        merge(finalTagData, props);
      }
      if (forms.generalData.document) {
        finalTagData["bpmn:documentation"] = forms.generalData.document;
      }
      let extensionElements = forms.extensionElements.map((e) => {
        return {
          "-name": e.name,
          "-value": e.value,
        };
      });
      objectInit(
        finalTagData,
        ["bpmn:extensionElements", "zeebe:properties", "zeebe:property"],
        [],
      );
      let props: typeof extensionElements =
        finalTagData["bpmn:extensionElements"]["zeebe:properties"][
          "zeebe:property"
        ];
      props.unshift(...extensionElements);
      bpmnDi["bpmndi:BPMNShape"].push(finalshapeData);
      if (processData[type]) {
        if (processData[type] instanceof Array) {
          processData[type].push(finalTagData);
        } else {
          let first = processData[type] as processDataItem;
          processData[type] = [first, finalTagData];
        }
      } else {
        processData[type] = finalTagData;
      }
    } else {
      console.error(`警告：`, node, "没有id");
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
    console.log("this", this);
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
