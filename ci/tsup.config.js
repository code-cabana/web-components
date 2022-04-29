import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/components/hello/hello.tsx"],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: !options.prod,
  external: ["esbuild"],
}));
