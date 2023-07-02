import { nodeDefinition } from "../types";

export let allNodes: Record<string, nodeDefinition> = {};
let modules = import.meta.glob("./**/*.tsx", { eager: true });
Object.keys(modules).forEach((path: string) => {
  let resource = modules[path] as Record<string, nodeDefinition>;
  for (const key in resource) {
    if (Object.prototype.hasOwnProperty.call(resource, key)) {
      const exportItem = resource[key];
      allNodes[exportItem.type] = exportItem;
    }
  }
});
