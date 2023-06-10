import { nodeDefinition } from "../types";
import { endEvent } from "./event/endEvent";
import { startEvent } from "./event/startEvent";

export let allNodes: Record<string, nodeDefinition> = {
  [startEvent.type]: startEvent,
  [endEvent.type]: endEvent,
};
