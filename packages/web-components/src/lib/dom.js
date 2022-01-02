import { error } from "./logger";
import { h } from "atomico";
import xhtm from "xhtm";
const html = xhtm.bind(h);

// Grabs the start and end elements of a component that wraps dom elements
export function getBookends(componentName, id) {
  const bookends = document.querySelectorAll(
    `codecabana-${componentName}${id ? `#${id}` : ":not([id])"}`
  );
  return bookends;
}

// Validates the start and end elements of a component that wraps dom elements
export function validateBookends(bookends, id) {
  if (!bookends || bookends.length < 1) return false;

  if (bookends.length === 1) {
    error(
      `[CC] Accordion ${
        id ? `with id: "${id}" ` : ""
      }does not have a matching beginning/end`
    );
    return false;
  }

  if (bookends.length > 2) {
    error(
      `[CC] Too many accordions${
        id ? ` with the same id: "${id}"` : ""
      }. Only one start & end per id is allowed. To add more accordions, specify an id. E.g: <codecabana-accordion id="accordion1"></codecabana-accordion>`
    );
    return false;
  }

  return true;
}

// Returns the child closest to the parent
export function getClosestChild(parent, nestedChild) {
  let child = nestedChild;
  while (child.parentElement !== parent) {
    child = child.parentElement;
  }
  return child;
}

// Returns a range between two elements
// https://developer.mozilla.org/en-US/docs/Web/API/Range
export function getRange(startEl, endEl, includeFirst, includeLast) {
  const range = new Range();
  includeFirst ? range.setStartBefore(startEl) : range.setStartAfter(startEl);
  includeLast ? range.setEndAfter(endEl) : range.setEndBefore(endEl);
  return range;
}

// Converts an HTMLCollection to string
export function htmlCollectionToString(collection) {
  return Array.from(collection)
    .map((el) => el.outerHTML)
    .join("");
}
// Render an HTML string using xhtm
export function renderHtml(htmlString) {
  return html([htmlString]);
}

// Sanitizes an HTML element's inner text
// Necessary because Atomico incorrectly renders HTML tags if rogue apostrophes or quotes are present
export function sanitizeTextContent(element) {
  recurseTextContent(element, escapeQuotes);
}

// Call a function that receives all children node textContents as input
function recurseTextContent(node, callback) {
  if (!node | (typeof callback !== "function")) return;
  if (node.nodeType === 3) {
    node.textContent = callback(node.textContent); // If the current node is a text node, do the replacement
  } else {
    Array.from(node.childNodes).forEach(function (child) {
      recurseTextContent(child, callback); // Otherwise recurse into its children
    });
  }
}

// Replaces all instances of ' -> ’ and "word" -> “word”
function escapeQuotes(string) {
  return string
    .replace(/'/gm, "’")
    .replace(/(\s)"/gm, "$1“")
    .replace(/"(\s)/gm, "”$1");
}

// Extracts translation values from a CSS matrix string
export function getMatrixTranslateValues(matrixString) {
  const matrixType = matrixString.includes("3d") ? "3d" : "2d";
  const match = matrixString.match(/matrix.*\((.+)\)/);
  if (!match) return null;
  const matrixValues = matrixString.match(/matrix.*\((.+)\)/)[1].split(", ");
  return matrixType === "2d"
    ? { x: matrixValues[4], y: matrixValues[5], matrixType }
    : matrixType === "3d"
    ? {
        x: matrixValues[12],
        y: matrixValues[13],
        z: matrixValues[14],
        matrixType,
      }
    : {};
}
