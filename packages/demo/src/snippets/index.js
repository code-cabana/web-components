import accordion from "./accordion.html";

const snippets = {
  accordion,
};

export default function getSnippet(componentName) {
  return snippets[componentName];
}
