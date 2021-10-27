import parse from "html-react-parser";

export function renderHtml(htmlString) {
  return parse(htmlString);
}
