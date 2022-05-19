const { build } = require("esbuild");
const baseConfig = require("./esbuild.config.js");

build({
  ...baseConfig,
  minify: true,
}).catch(() => process.exit(1));
