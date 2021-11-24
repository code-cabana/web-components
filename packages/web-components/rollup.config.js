import glob from "fast-glob";
import { terser } from "rollup-plugin-terser";
import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import scss from "rollup-plugin-scss";

const production = !process.env.ROLLUP_WATCH;
const formats = ["iife", "umd", "es"];
const targetProject = production ? "." : "../demo/public";

const components = glob
  .sync(["src/components/**/*.component.js"])
  .map((path) => path.match(/.*[\\\/](.*?).component.js/)[1]);

const commonConfig = {
  plugins: [
    resolve({
      browser: true,
      dedupe: ["atomico"],
    }),
    scss({ output: false }),
    babel({ babelHelpers: "bundled" }),
    commonjs(),
    // production && terser(),
  ],
  watch: { clearScreen: false },
};

const componentConfigs = components.map((component) => ({
  ...commonConfig,
  input: `src/components/${component}/${component}.component.js`,
  output: formats.map((format) => ({
    name: component,
    file: `${targetProject}/dist/${format}/${component}.js`,
    format,
    assetFileNames: "[name][extname]",
  })),
}));

const rootModuleConfig = {
  ...commonConfig,
  input: "src/index.js",
  output: {
    file: `${targetProject}/dist/index.js`,
  },
};

export default [rootModuleConfig, ...componentConfigs];
