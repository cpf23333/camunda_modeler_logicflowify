declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "production" | "development";
    }
  }
  /**深度只读 */
  type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends { [key: string]: any }
      ? DeepReadonly<T[P]>
      : T[P];
  };
}
declare module "*.scss";
export {};
