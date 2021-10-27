import glob from "tiny-glob";
import { terser } from "rollup-plugin-terser";
import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import scss from "rollup-plugin-scss";

const production = !process.env.ROLLUP_WATCH;
const formats = ["iife", "umd", "es"];
const targetProject = production ? "." : "../demo/public";
const components = await glob("src/components/**/*.component.js").then(
  (paths) => paths.map((path) => path.match(/.*[\\\/](.*?).component.js/)[1])
);

export default components.map((component) => ({
  input: `src/components/${component}/${component}.component.js`,
  output: formats.map((format) => ({
    name: component,
    file: `${targetProject}/dist/${format}/${component}.js`,
    format,
    assetFileNames: "[name][extname]",
  })),
  plugins: [
    resolve({
      browser: true,
      dedupe: ["atomico"],
    }),
    scss({ output: false }),
    babel(),
    commonjs(),
    terser(),
  ],
  watch: {
    clearScreen: false,
  },
}));
