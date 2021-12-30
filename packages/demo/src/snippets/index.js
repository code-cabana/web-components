import accordion from "./accordion.html";
import carousel from "./carousel.html";
import slideshow from "./slideshow.html";

const snippets = {
  accordion,
  carousel,
  slideshow,
};

export default function getSnippet(componentName) {
  return snippets[componentName];
}
