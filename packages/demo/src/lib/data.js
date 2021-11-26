import glob from "tiny-glob";

export async function getComponentList(pathPrefix = "..") {
  return (
    await glob(`${pathPrefix}/web-components/src/components/**/*.component.jsx`)
  ).map((path) => path.match(/.*[\\\/](.*?).component.js/)[1]);
}
