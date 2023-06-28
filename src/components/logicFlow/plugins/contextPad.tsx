import { For, render } from "solid-js/web";
import { Logicflow } from "../class";
import { AiOutlineDelete } from "solid-icons/ai";
import { JSX } from "solid-js/jsx-runtime";
import style from "./contextPad.module.scss";
import { endEvent } from "../nodes/event/endEvent";
import { nodeDefinition } from "../types";
interface eventData {
  id: string;
  properties: Record<string, any>;
  text: {
    x: number;
    y: number;
    value: string;
  };
  x: number;
  y: number;
}
export type contextPadConfig = (
  data: eventData,
  lf: Logicflow,
) => {
  /**图标 */
  icon: nodeDefinition["icon"];
  /**点击图标触发的回调函数
   *
   * 如果不设置回调函数，默认是要新增节点
   */
  callback?: (data: eventData, lf: Logicflow) => void;
  /**名称 */
  name: () => string;
};
interface contextPadAddNodeConfig {
  icon: nodeDefinition["icon"];
  type: string;
  name: () => string;
  properties?: Record<string, any>;
}

const COMMON_TYPE_KEY = "menu-common";
const NEXT_X_DISTANCE = 200;
const NEXT_Y_DISTANCE = 100;
const panelIconSize = 24;
let deleteConfig: contextPadConfig = () => {
  return {
    icon: () => (
      <AiOutlineDelete
        size={panelIconSize}
        fill="red"></AiOutlineDelete>
    ),
    name: () => "删除",
    callback(data, lf) {
      let targetNodeOrEdge = lf.getModelById(data.id);
      if (targetNodeOrEdge) {
        if (targetNodeOrEdge.BaseType === "edge") {
          lf.deleteEdge(targetNodeOrEdge.id);
        } else if (targetNodeOrEdge.BaseType === "node") {
          lf.deleteNode(targetNodeOrEdge.id);
        }
      }
    },
  };
};
let nodeConfgs: contextPadAddNodeConfig[] = [
  {
    icon: endEvent.icon,
    name: endEvent.name,
    type: endEvent.topType || endEvent.type,
    properties: {},
  },
];

/**
 *  copy自官档
 *  @link https://site.logic-flow.cn/docs/#/zh/guide/extension/component-custom?id=%e5%ae%9e%e7%8e%b0-context-pad-%e6%8f%92%e4%bb%b6
 */
export class ContextPad {
  lf: Logicflow;
  static pluginName = "contextPad";
  menuTypeMap: Map<any, any>;
  __menuDOM: HTMLDivElement;
  container: any;
  isShow: any;

  constructor({ lf }: { lf: Logicflow }) {
    this.menuTypeMap = new Map();
    this.lf = lf;
    this.__menuDOM = document.createElement("div");
    this.__menuDOM.classList.add("lf-inner-context");
    this.menuTypeMap.set(COMMON_TYPE_KEY, []);
  }
  render(lf: Logicflow, container: HTMLElement) {
    this.container = container;
    lf.on("node:click", ({ data }) => {
      this.createContextMenu(data);
    });
    lf.on("edge:click", ({ data }) => {
      this.createContextMenu(data);
    });
    lf.on("blank:click", () => {
      this.hideContextMenu();
    });
  }
  setContextMenuByType = (type: any, menus: any) => {
    this.menuTypeMap.set(type, menus);
  };
  /**
   * 隐藏菜单
   */
  hideContextMenu() {
    this.__menuDOM.innerHTML = "";
    this.__menuDOM.style.display = "none";
    if (this.isShow) {
      this.container.removeChild(this.__menuDOM);
    }
    this.lf.off(
      "node:delete,edge:delete,node:drag,graph:transform",
      this.listenDelete,
    );
    this.isShow = false;
  }
  nodeConfigs: contextPadConfig[] = nodeConfgs.map((conf) => {
    return () => {
      return {
        icon: conf.icon,
        name: conf.name,
        callback: (data) => {
          this.addNode({
            sourceId: data.id,
            properties: conf.properties || {},
            type: conf.type,
            x: data.x,
            y: data.y,
          });
        },
      };
    };
  });
  /**
   * 显示指定元素菜单
   * @param  data 节点id、节点类型、菜单位置
   */
  showContextMenu(data: eventData | undefined) {
    if (!data || !data.id) {
      console.warn("请检查传入的参数");
      return;
    }
    this.createContextMenu(data);
  }
  setContextMenuItems(menus: any) {
    this.menuTypeMap.set(COMMON_TYPE_KEY, menus);
  }
  /**
   * 获取新菜单位置
   */
  getContextMenuPosition(data: eventData) {
    const Model = this.lf.graphModel.getElement(data.id);
    if (!Model) {
      console.warn(`找不到元素${data.id}`);
      return;
    }
    let x: number = 0;
    let y: number = 0;
    if (Model.BaseType === "edge") {
      x = Number.MIN_SAFE_INTEGER;
      y = Number.MAX_SAFE_INTEGER;
      const edgeData = Model.getData();
      x = Math.max(edgeData.startPoint.x, x);
      y = Math.min(edgeData.startPoint.y, y);
      x = Math.max(edgeData.endPoint.x, x);
      y = Math.min(edgeData.endPoint.y, y);
      if (edgeData.pointsList) {
        edgeData.pointsList.forEach((point) => {
          x = Math.max(point.x, x);
          y = Math.min(point.y, y);
        });
      }
    }
    if (Model.BaseType === "node") {
      x = data.x + Model.width / 2;
      y = data.y - Model.height / 2;
    }
    return this.lf.graphModel.transformModel.CanvasPointToHtmlPoint([x, y]);
  }
  createContextMenu(data: eventData) {
    const { isSilentMode } = this.lf.options;
    // 静默模式不显示菜单
    if (isSilentMode) {
      return;
    }
    let items: ReturnType<contextPadConfig>[] = [];
    let target = this.lf.getModelById(data.id);
    if (target.BaseType === "node") {
      if (target.type !== endEvent.type) {
        items.push(...this.nodeConfigs.map((conf) => conf(data, this.lf)));
      }
    }
    items.push(deleteConfig(data, this.lf));

    this.__menuDOM.innerHTML = "";
    this.__menuDOM.style.background = "white";
    let clickFunc = (item: ReturnType<contextPadConfig>) => {
      if (item.callback) {
        item.callback(data, this.lf);
      }
      this.hideContextMenu();
    };
    render(() => {
      return (
        <div
          style={{
            display: "flex",
            "flex-wrap": "wrap",
            "max-width": `${panelIconSize * 2}px`,
          }}>
          <For each={items}>
            {(item) => (
              <span
                title={item.name()}
                class={style.item}
                onClick={() => {
                  clickFunc(item);
                }}>
                {item.icon({ size: panelIconSize })}
              </span>
            )}
          </For>
        </div>
      );
    }, this.__menuDOM);
    this.showMenu(data);
  }

  addNode(
    node: { sourceId: any; x: any; y: any; properties: any; type: any },
    y?: number,
  ) {
    const isDeep = y !== undefined;
    if (y === undefined) {
      y = node.y;
    }
    const nodeModel = this.lf.getNodeModelById(node.sourceId);
    const leftTopX = node.x - nodeModel.width + NEXT_X_DISTANCE;
    const leftTopY = y! - node.y / 2 - 20;
    const rightBottomX = node.x + nodeModel.width + NEXT_X_DISTANCE;
    const rightBottomY = y! + node.y / 2 + 20;
    const exsitElements = this.lf.getAreaElement(
      [leftTopX, leftTopY],
      [rightBottomX, rightBottomY],
    );
    if (exsitElements.length) {
      y = y! + NEXT_Y_DISTANCE;
      this.addNode(node, y);
      return;
    }
    const newNode = this.lf.addNode({
      type: node.type,
      x: node.x + 200,
      y: y!,
      properties: node.properties,
    });
    let startPoint;
    let endPoint;
    if (isDeep) {
      startPoint = {
        x: node.x,
        y: node.y + nodeModel.height / 2,
      };
      endPoint = {
        x: newNode.x - newNode.width / 2,
        y: newNode.y,
      };
    }
    this.lf.addEdge({
      sourceNodeId: node.sourceId,
      targetNodeId: newNode.id,
      startPoint,
      endPoint,
    });
  }

  showMenu(data: eventData) {
    const [x, y] = this.getContextMenuPosition(data) || [];
    this.__menuDOM.style.display = "flex";
    this.__menuDOM.style.top = `${(y || 0) - 5}px`;
    this.__menuDOM.style.left = `${(x || 0) + 10}px`;
    this.__menuDOM.style.padding = "5px";
    this.container.appendChild(this.__menuDOM);
    // 菜单显示的时候，监听删除，同时隐藏
    !this.isShow &&
      this.lf.on(
        "node:delete,edge:delete,node:drag,graph:transform",
        this.listenDelete,
      );
    this.isShow = true;
  }

  listenDelete = () => {
    this.hideContextMenu();
  };
}
