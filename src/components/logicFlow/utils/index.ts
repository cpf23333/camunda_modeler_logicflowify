import Ids from "ids";
const ids = new Ids([32, 32, 1]);
export function getBpmnId(): string {
  return ids.next();
}
/**给xmlJson对象添加一个标签的数据 */
export let xmlJsonAddTagData = (
  /**xmlJson数据对象*/
  xmlJson: Record<string, any>,
  /**标签名称 */
  tagName: string,
  /**标签数据 */
  data: Record<string, any>,
) => {
  let rawData = xmlJson[tagName];
  if (rawData) {
    if (rawData instanceof Array) {
      rawData.push(data);
    } else {
      xmlJson[tagName] = [rawData, data];
    }
  } else {
    xmlJson[tagName] = data;
  }
};
let transTag2Json = (dom: HTMLElement) => {
  let json: Record<string, any> = {};
  if (dom.hasAttributes()) {
    for (const attr of dom.attributes) {
      let { name, value } = attr;
      json["-" + name] = value;
    }
  }
  dom.childNodes.forEach((node) => {
    if (node.nodeName.startsWith("#")) {
      let text = node.textContent?.trim();
      if (text) {
        json[node.nodeName] = text;
      }
    } else {
      xmlJsonAddTagData(
        json,
        node.nodeName,
        transTag2Json(node as HTMLElement),
      );
    }
  });
  return json;
};
export let xml2Json = (xml: string) => {
  let parser = new DOMParser();
  let dom = parser.parseFromString(xml, "application/xml");
  let errorTags: HTMLCollectionOf<HTMLElement> = dom.getElementsByTagName(
    "parsererror",
  ) as HTMLCollectionOf<HTMLElement>;
  if (errorTags.length) {
    console.error(
      ...Array.from(errorTags).map((dom) => {
        return dom.innerText;
      }),
    );
    throw new Error("解析错误");
  }
  return {
    [dom.documentElement.nodeName]: transTag2Json(dom.documentElement),
  };
};
/**传入节点的json，返回拓展属性数组 */
export let getProperties = (xmlJson: Record<string, any>) => {
  let props: any[] =
    xmlJson["bpmn:extensionElements"]?.["zeebe:properties"]?.[
      "zeebe:property"
    ] || [];
  if (props) {
    if (!(props instanceof Array)) {
      props = [props];
    }
    return props.map((o) => {
      return {
        name: o["-name"],
        value: o["-value"],
      };
    });
  }
  return [];
};
/**传入要解析的json，返回属性Map */
export let getPropertiesMap = (
  /**要解析的节点的xmlJson */
  xmlJson: Record<string, any>,
  /**会有重复name的属性 */
  isArray?: string[],
) => {
  let props = getProperties(xmlJson);
  let obj: Record<string, any> = {};
  if (isArray) {
    let keySet = new Set(isArray);
    props.forEach((prop) => {
      if (keySet.has(prop.name)) {
        if (!obj[prop.name]) {
          obj[prop.name] = [];
        }
        obj[prop.name].push(prop.value);
      } else {
        obj[prop.name] = prop.value;
      }
    });
  } else {
    props.forEach((prop) => {
      xmlJsonAddTagData(obj, prop.name, prop.value);
    });
  }

  return obj;
};
