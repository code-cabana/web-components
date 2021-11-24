import accordion from "./accordion.html";
import carousel from "./carousel.html";

const snippets = {
  accordion,
  carousel,
};

export default function getSnippet(componentName) {
  return snippets[componentName];
}
