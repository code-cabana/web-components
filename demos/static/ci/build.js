/*
  This file builds liquid ./ci/templates into ./index.html and ./components/*.html
  Using the filesystem to generate a list of the current components
*/
import snippets from "../templates/snippets";
import { Liquid } from "liquidjs";
import glob from "fast-glob";
import path from "path";
import fs from "fs";

const cwd = path.resolve(__dirname);
const components = getComponentList();
const comment = "<!-- GENERATED FROM ./demos/static/templates -->";
const engine = new Liquid({
  root: `${cwd}/../templates`,
  extname: ".liquid",
});

function build() {
  renderIndexPage();
  renderComponentPages();
}

function renderIndexPage() {
  engine
    .renderFile("index", { components })
    .then((content) =>
      writeToFile(`${cwd}/../index.html`, `${comment}\n${content}`)
    );
}

function renderComponentPages() {
  components.forEach((name) => {
    const component = {
      name,
      snippet: snippets[name] || snippets["default"](name),
    };

    engine
      .renderFile("component", { component })
      .then((content) =>
        writeToFile(
          `${cwd}/../components/${name}.html`,
          `${comment}\n${content}`
        )
      );
  });
}

// Returns array of all component names
function getComponentList() {
  const projectRoot = "../../";
  const componentsDir = `${projectRoot}components/src/components`;
  const paths = glob.sync([`${componentsDir}/*/wc.tsx`]);
  return paths.map((path) => {
    const frags = path.split("/");
    return frags[frags.length - 2]; // Return last directory name (* wildcard in glob)
  });
}

// Writes content to index.html file
function writeToFile(filePath, content) {
  fs.writeFile(filePath, content, (err) => {
    if (err) console.error(err);
  });
}

build();
