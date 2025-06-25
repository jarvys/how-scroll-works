import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  output: {
    assetPrefix: "/how-scroll-works/",
  },
  plugins: [pluginReact()],
});
