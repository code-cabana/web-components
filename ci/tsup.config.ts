import { defineConfig, Options } from "tsup";

type Flags = { prod?: boolean };

export default defineConfig((options: Options & Flags) => ({
  entry: ["src/components/hello/hello.tsx"],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: !options.prod,
  external: ["esbuild"],
}));
