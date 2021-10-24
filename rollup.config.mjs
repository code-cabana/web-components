import glob from "tiny-glob";
import { terser } from "rollup-plugin-terser";
import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

//const production = !process.env.ROLLUP_WATCH;
const formats = ["iife", "umd", "es"];
const components = await glob("src/components/**/*.js").then((paths) =>
  paths.map((path) => path.match(/.*[\\\/](.*?).js/)[1])
);

export default components.map((component) => ({
  input: `src/components/${component}/${component}.js`,
  output: formats.map((format) => ({
    name: component,
    file: `public/dist/${format}/${component}.min.js`,
    format,
    assetFileNames: "[name][extname]",
  })),
  plugins: [
    resolve({
      browser: true,
      dedupe: ["atomico"],
    }),
    babel(),
    commonjs(),
    terser(),
  ],
  watch: {
    clearScreen: false,
  },
}));
