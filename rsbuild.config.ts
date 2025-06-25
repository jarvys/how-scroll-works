import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  output: {
    assetPrefix: "/jarvys/how-scroll-works/",
  },
  plugins: [pluginReact()],
});
