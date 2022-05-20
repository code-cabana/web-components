const build = require("./esbuild.config.js");

build({
  common: {
    watch: true,
    sourcemap: "inline",
  },
});
