import AccordionItem from "./item";
import { c, useEffect, useHost, useProp, useState } from "atomico";
import { debug, error } from "../../lib/logger";
import {
  getBookends,
  getRange,
  htmlCollectionToString,
  validateBookends,
} from "../../lib/dom";

const style = `
:host {
  display: grid;
  grid-auto-flow: row;
  padding: 0 16px;
}

.item {
    background-color: #f5f5f5;
    border: 1px solid #e1e1e1;
    transition: background-color 0.2s;
    overflow: hidden;
  }

  .heading {
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: 32px;
    align-items: center;
    width: 100%;
    text-align: left;
    border: none;
    padding: 4px 16px;

    background-color: transparent;
    color: black;
    cursor: pointer;
  }

  .icon,
  .expandedIcon {
    max-width: 32px;
    opacity: 0.5;
  }

  .item:hover .icon,
  .item:hover .expandedIcon {
    opacity: 1;
  }

  .item.expanded {
    background-color: white;
  }

  .item.expanded .icon {
    display: none;
  }
  .item.expanded .content {
    padding: 0 16px;
    visibility: visible;
  }

  .item:not(.expanded) .expandedIcon {
    display: none;
  }

  .item:not(.expanded) .content {
    visibility: hidden;
    padding: 0;
  }

  .item:first-child {
    border-radius: 8px 8px 0 0;
  }

  .item:last-child {
    border-radius: 0 0 8px 8px;
  }

  .item:not(:last-child) {
    border-bottom: 0;
  }
`;

function Accordion() {
  const host = useHost();
  const [id] = useProp("id");
  const [dbug] = useProp("debug");
  const [icon] = useProp("icon");
  const [expandedIcon] = useProp("expandedIcon");
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
    document.addEventListener("DOMContentLoaded", () => {
      init();
    });

    document.addEventListener("pageChange", () => {
      init();
    });
  }, []);

  const valid = items.length > 0;
  return valid ? (
    <host shadowDom>
      <div class="items">
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
      <style>{style}</style>
    </host>
  ) : (
    <div />
  );
}

Accordion.props = {
  id: {
    type: String,
    reflect: true,
    value: "accordion",
  },
  debug: {
    type: Boolean,
    reflect: false,
    value: false,
  },
  icon: {
    type: String,
    reflect: true,
    value: "https://img.icons8.com/ios-glyphs/452/chevron-right.png",
  },
  expandedIcon: {
    type: String,
    reflect: true,
    value: "https://img.icons8.com/ios-glyphs/452/chevron-down.png",
  },
};

customElements.define("codecabana-accordion", c(Accordion));
