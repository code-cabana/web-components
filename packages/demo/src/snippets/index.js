import accordion from "./accordion.html";
import carousel from "./carousel.html";
import slideshow from "./slideshow.html";
import tabs from "./tabs.html";

const snippets = {
  accordion,
  carousel,
  slideshow,
  tabs,
};

export default function getSnippet(componentName) {
  return snippets[componentName];
}
