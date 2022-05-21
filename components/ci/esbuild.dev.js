const build = require("./esbuild.common.js");

build({
  watch: true,
  sourcemap: "inline",
});
