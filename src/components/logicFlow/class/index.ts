import { LogicFlow as oldLogicFlow } from "@logicflow/core";
interface Forms {
  /**常规情况下都使用这个存储rightPanel的表单数据 */
  baseModel: object;
  /**折叠面板状态存储区 */
  collapseData: object;
}
type NodeOrEdgeId = string;
export class Logicflow extends oldLogicFlow {
  async initForm(id: NodeOrEdgeId) {
    this.forms[id] = {
      baseModel: {},
      collapseData: {},
    };
  }
  getForm(id: NodeOrEdgeId) {
    return this.forms[id];
  }
  /**实际存储 */
  private forms: Record<NodeOrEdgeId, Forms> = {};
}
