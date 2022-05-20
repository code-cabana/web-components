const build = require("./esbuild.config.js");

build({
  common: {
    minify: true,
  },
});
