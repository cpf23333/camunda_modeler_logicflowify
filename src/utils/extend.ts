import { Component } from "solid-js";

export {};
/** */
export type ModelComponent<T = any> = Component<
  T & {
    /**数组，[get,set] */
    model: [() => any, (v: any) => any];
  }
>;
export type ModelProp<T = any> = {
  /**数组，[get,set] */
  model: [() => any, (v: any) => any];
} & T;
