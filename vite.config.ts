import { Plugin, defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import compress from "vite-plugin-compression";
function _resolve(dir: string) {
  return resolve(__dirname, dir);
}
let addOnPlugin: Array<Plugin> = [];
if (process.env.NODE_ENV === "production") {
  addOnPlugin.push(compress());
}

export default defineConfig({
  base: "./",
  plugins: [
    devtools({
      /* additional options */
      autoname: true, // e.g. enable autoname
    }),
    solidPlugin(),
    visualizer({
      filename: "dist/stats.html",
    }),
    ...addOnPlugin,
  ],
  resolve: {
    alias: {
      "@": _resolve("src"),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          // "lodash-es": ["lodash-es"],
          "@logicflow/core": ["@logicflow/core"],
          "@logicflow/extension": ["@logicflow/extension"],
        },
      },
    },
  },
});
