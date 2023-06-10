declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "production" | "development";
    }
  }
}
declare module "*.scss";
export {};
