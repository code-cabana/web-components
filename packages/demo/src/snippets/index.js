import accordion from "./accordion.html";
import carousel from "./carousel.html";
import slideshow from "./slideshow.html";
import tabs from "./tabs.html";
import typewriter from "./typewriter.html";

const snippets = {
  accordion,
  carousel,
  slideshow,
  tabs,
  typewriter,
};

export default function getSnippet(componentName) {
  return snippets[componentName];
}
