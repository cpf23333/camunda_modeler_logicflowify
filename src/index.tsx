/* @refresh reload */
import "@/styles/index.scss";
import { RouteDefinition, Router } from "@solidjs/router";
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?",
  );
}
let routes: Array<RouteDefinition> = [
  {
    path: "/",
    component: lazy(() => import("./pages/index")),
    info: {
      title: "常规页面",
    },
  },
  {
    path: "/elk",
    component: lazy(() => import("./pages/elk-layout/index")),
    info: {
      title: "ELK",
    },
  },
];
render(() => <Router root={App}>{routes}</Router>, root!);
