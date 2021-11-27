import AccordionItem from "./item";
import { c, useEffect, useHost, useState } from "atomico";
import { debug, error } from "../../lib/logger";
import {
  getBookends,
  getRange,
  htmlCollectionToString,
  validateBookends,
} from "../../lib/dom";
import styles from "./accordion.scss";

function Accordion({ id, debug: dbug, icon, expandedIcon }) {
  const host = useHost();
  const [items, setItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  function extractItem(headingEl, index, headings, docFrag) {
    const isLastHeading = !headings[index + 1];
    const itemRange = getRange(
      headingEl,
      isLastHeading ? docFrag.lastElementChild : headings[index + 1],
      false,
      isLastHeading
    );
    const { children } = itemRange.cloneContents();

    const hasContent = children && children.length > 0;
    const valid = hasContent;
    const heading = headingEl.outerHTML;
    const content = htmlCollectionToString(children);

    if (!hasContent)
      error(`Heading: "${headingEl.innerHTML}" has no content underneath it`);

    return valid && { id: index, heading, content };
  }

  function extractItems(range) {
    const docFrag = range.extractContents();
    const headings = Array.from(
      docFrag.querySelectorAll("h1, h2, h3, h4, h5, h6")
    );
    dbug && debug("Headings: ", headings);

    const newItems = headings
      .map((headingEl, index) =>
        extractItem(headingEl, index, headings, docFrag)
      )
      .filter(Boolean);

    dbug && debug("Items", newItems);
    setItems(newItems);
  }

  function init() {
    const bookends = getBookends("accordion", id);
    dbug && debug("Bookends:", bookends);
    if (!validateBookends(bookends, id)) return;
    const isStart = bookends[0] === host.current;
    if (!isStart) return;
    const range = getRange(bookends[0], bookends[1]);
    extractItems(range);
  }

  useEffect(() => {
    init();
    document.addEventListener("DOMContentLoaded", () => init);
    document.addEventListener("pageChange", () => init);
  }, []);

  const valid = items.length > 0;
  return valid ? (
    <host shadowDom>
      <div class="items" part="items">
        {items.map((item, index) => {
          const { heading, content } = item;
          const expanded = expandedItems[index];
          return AccordionItem({
            heading,
            content,
            icon,
            expandedIcon,
            expanded,
            setExpanded: () => {
              setExpandedItems({ ...expandedItems, [index]: !expanded });
            },
          });
        })}
      </div>
      <style>{styles}</style>
    </host>
  ) : (
    <div />
  );
}

Accordion.props = {
  id: {
    type: String,
    reflect: true,
  },
  debug: {
    type: Boolean,
    reflect: false,
    value: false,
  },
  icon: {
    type: String,
    reflect: false,
    value: "https://img.icons8.com/ios-glyphs/452/chevron-right.png",
  },
  expandedIcon: {
    type: String,
    reflect: false,
    value: "https://img.icons8.com/ios-glyphs/452/chevron-down.png",
  },
};

customElements.define("codecabana-accordion", c(Accordion));
