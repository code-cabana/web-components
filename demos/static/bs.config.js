const bs = require("browser-sync").create();

bs.init({
  server: true,
  watch: true,
  open: false,
  port: 4000,
  ui: { port: 4001 },
});
