import { v4 } from "uuid";
/**获取一个bpmnid */
export function getBpmnId() {
  return v4();
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
