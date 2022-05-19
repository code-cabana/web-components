const { build } = require("esbuild");
const baseConfig = require("./esbuild.config.js");

build({
  ...baseConfig,
  watch: true,
  sourcemap: "inline",
}).catch(() => process.exit(1));
