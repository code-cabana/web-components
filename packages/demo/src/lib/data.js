import glob from "tiny-glob";
import { blacklist } from "../../../web-components/src/config/components";

export async function getComponentList(pathPrefix = "..") {
  return (
    await glob(`${pathPrefix}/web-components/src/components/**/*.component.js`)
  )
    .map((path) => path.match(/.*[\\\/](.*?).component.js/)[1])
    .filter((component) => !blacklist.includes(component));
}
