/*
  This file builds liquid ./ci/templates into ./index.html and ./components/*.html
  Using the filesystem to generate a list of the current components
*/
import { Liquid } from "liquidjs";
import glob from "fast-glob";
import path from "path";
import fs from "fs";

const templatesDir = path.resolve(__dirname, "../templates");
const componentsDir = path.resolve(__dirname, "../components");
const outDir = path.resolve(__dirname, "../out");
const outComponentsDir = `${outDir}/components`;
const componentNames = getComponentList();
const comment = "<!-- GENERATED FROM /demos/static/templates/*.liquid -->";
const engine = new Liquid({
  root: templatesDir,
  extname: ".liquid",
});

export default function build() {
  createOutDirs();
  renderIndexPage();
  renderComponentPages();
}

function renderIndexPage() {
  engine
    .renderFile("index", { componentNames })
    .then((content) =>
      writeToFile(`${outDir}/index.html`, `${comment}\n${content}`)
    );
}

function renderComponentPages() {
  componentNames.forEach((name) => {
    const component = {
      name,
      body: getComponentBody(name),
    };

    engine
      .renderFile("component", { component })
      .then((content) =>
        writeToFile(
          `${outDir}/components/${name}.html`,
          `${comment}\n${content}`
        )
      );
  });
}

// Returns array of all component names
function getComponentList() {
  const componentsSrcDir = `../../components/src/components`;
  const paths = glob.sync([`${componentsSrcDir}/*/wc.tsx`]);
  return paths.map((path) => {
    const frags = path.split("/");
    return frags[frags.length - 2]; // Return last directory name (* wildcard in glob)
  });
}

// Creates the output directories if they don't exist
function createOutDirs() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  if (!fs.existsSync(outComponentsDir)) fs.mkdirSync(outComponentsDir);
}

// Writes content to index.html file
function writeToFile(filePath, content) {
  fs.writeFile(filePath, content, (err) => {
    if (err) console.error(err);
  });
}

// Loads the component's html file if it exists
function getComponentBody(name) {
  try {
    return (
      readFile(`${componentsDir}/${name}.html`) ||
      `<codecabana-${name}></codecabana-${name}>`
    );
  } catch (error) {
    console.warn("[WARN]", `component .html file missing - ${name}`);
  }
}

// Reads and returns file content
function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}
