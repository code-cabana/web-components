const { build } = require("esbuild");
const glob = require("fast-glob");
const pluginsJsxRuntime = require("@uppercod/esbuild-jsx-runtime");

module.exports = ({ browser: _browser, esm: _esm, common: _common }) => {
  const common = {
    bundle: true,
    loader: { ".ts": "tsx" },
    external: ["esbuild"],
    ..._common,
  };

  const browser = {
    entryPoints: glob.sync(["src/components/*/wc.tsx"]),
    outdir: "./dist/browser",
    target: ["chrome89", "firefox91", "safari15", "ios15"],
    entryNames: "[dir]/index",
    plugins: [pluginsJsxRuntime()],
    ...common,
    ..._browser,
  };

  const esm = {
    entryPoints: ["src/components/index.tsx"],
    outdir: "./dist/esm",
    format: "esm",
    target: ["esnext"],
    ...common,
    ..._esm,
  };

  [browser, esm].forEach((config) => {
    console.log("build", config);
    build(config).catch(() => process.exit(1));
  });
};
