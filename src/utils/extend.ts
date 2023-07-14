import { Component } from "solid-js";

export {};
/** */
export type ModelComponent<T> = Component<
  T & {
    /**数组，[get,set] */
    model: [() => any, (v: any) => any];
  }
>;
