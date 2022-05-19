const glob = require("fast-glob");
module.exports = {
  entryPoints: glob.sync(["src/components/*/index.tsx"]),
  bundle: true,
  outdir: "./dist",
  loader: { ".ts": "tsx" },
  target: ["chrome89", "firefox91", "safari15", "ios15"],
  external: ["esbuild"],
};

// TODO export esm module targeting "src/components/index.ts",
