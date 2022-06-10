// This file starts the browser-sync server
const bs = require("browser-sync").create();

bs.init({
  server: {
    baseDir: "out",
    directory: false,
    routes: {
      "/": "../../demos/static",
      "/@codecabana/web-components":
        "../../node_modules/@codecabana/web-components/",
    },
  },
  watch: true,
  open: false,
  port: 4000,
  ui: { port: 4001 },
});
