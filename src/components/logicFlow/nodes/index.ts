import { nodeDefinition } from "../types";
/**全部的节点和线 */
export let allNodes: Record<string, nodeDefinition> = {};
/**标签化的各项节点和线 */
export let taggedNodes: Record<nodeDefinition["type"], nodeDefinition[]> = {};
let modules = import.meta.glob("./**/*.tsx", { eager: true });
Object.keys(modules).forEach((path: string) => {
  let resource = modules[path] as Record<string, nodeDefinition>;
  for (const key in resource) {
    if (Object.prototype.hasOwnProperty.call(resource, key)) {
      const exportItem = resource[key];
      allNodes[exportItem.type] = exportItem;
      let tag = exportItem.topTag || exportItem.type;
      if (taggedNodes[tag]) {
        taggedNodes[tag].push(exportItem);
      } else {
        taggedNodes[tag] = [exportItem];
      }
    }
  }
});
