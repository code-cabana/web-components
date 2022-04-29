const { build } = require("esbuild");

const mode = process.env.MODE;
const prod = mode === "prod";

// Main
build({
  entryPoints: ["src/components/carousel/carousel.component.js"],
  bundle: true,
  minify: prod,
  watch: !prod,
  sourcemap: "inline",
  outdir: "./dist",
  loader: { ".js": "jsx" },
  target: ["chrome89", "firefox91", "safari15", "ios15"],

  //   jsxFactory: "h",
  //   jsxFragment: "Fragment",
  //   inject: ["ci/esbuild.shim.js"],
}).catch(() => process.exit(1));
