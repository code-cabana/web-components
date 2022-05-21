const { build } = require("esbuild");
const glob = require("fast-glob");
const pluginsJsxRuntime = require("@uppercod/esbuild-jsx-runtime");

module.exports = (options) => {
  build({
    bundle: true,
    loader: { ".ts": "tsx" },
    external: ["esbuild"],
    entryPoints: glob.sync(["src/components/*/wc.tsx"]),
    outdir: "./dist/browser",
    target: ["chrome89", "firefox91", "safari15", "ios15"],
    entryNames: "[dir]/index",
    plugins: [pluginsJsxRuntime()],
    ...options,
  }).catch(() => process.exit(1));
};
