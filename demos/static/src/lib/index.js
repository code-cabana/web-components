import fs from "fs";
import glob from "fast-glob";

const debugging = false;

// Returns array of all component names
export function getComponentList() {
  const componentsSrcDir = `../../components/src/components`;
  const paths = glob.sync([`${componentsSrcDir}/*/wc.tsx`]);
  return paths.map((path) => {
    const frags = path.split("/");
    return frags[frags.length - 2]; // Return last directory name (* wildcard in glob)
  });
}

// Loads the component's html file if it exists
export function getComponentBody(name) {
  try {
    return (
      readFile(`src/components/${name}.html`) ||
      `<codecabana-${name}></codecabana-${name}>`
    );
  } catch (error) {
    console.warn("[WARN]", `component .html file missing - ${name}`);
    debugging && console.debug(error);
  }
}

// Reads and returns file content
function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}
