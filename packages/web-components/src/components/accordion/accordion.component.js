import AccordionItem from "./item";
import { c, useEffect, useHost, useState } from "atomico";
import { debug, error } from "../../lib/logger";
import {
  getBookends,
  getRange,
  htmlCollectionToString,
  validateBookends,
  getClosestChild,
} from "../../lib/dom";
import styles from "./accordion.scss";

function Accordion({ id, debug: dbug, icon, expandedIcon }) {
  const host = useHost();
  const [active, setActive] = useState(false);
  const [items, setItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [hiddenContainer, setHiddenContainer] = useState();
  const [bookends, setBookends] = useState();
  const [commonAncestor, setCommonAncestor] = useState();

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

  function extractItems(range, bookends) {
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

    const hiddenContent = document.createElement("div");
    range.commonAncestorContainer.insertBefore(
      hiddenContent,
      getClosestChild(range.commonAncestorContainer, bookends[0])
    );
    hiddenContent.appendChild(docFrag);
    hiddenContent.style = "display: none;";
    hiddenContent.id = `codecabana-accordion-hidden-content-${id}`;
    setHiddenContainer(hiddenContent);
    setCommonAncestor(range.commonAncestorContainer);
  }

  function init() {
    const bookends = getBookends("accordion", id);
    dbug && debug("Bookends:", bookends);
    if (!validateBookends(bookends, id)) return;
    setBookends(bookends);
    const isStart = bookends[0] === host.current;
    if (!isStart) return;
    const range = getRange(bookends[0], bookends[1]);
    extractItems(range, bookends);
    setActive(true);
  }

  function destroy() {
    const isStart = bookends[0] === host.current;
    if (!isStart) return;
    setActive(false);

    const range = new Range();
    range.selectNodeContents(hiddenContainer);
    const hiddenContent = range.extractContents();
    commonAncestor.insertBefore(
      hiddenContent,
      getClosestChild(commonAncestor, bookends[1])
    );

    hiddenContainer.remove();

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setItems([]);
      })
    );
  }

  useEffect(() => {
    init();
    return () => destroy();
  }, []);

  useEffect(() => {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        console.log("MUTATION", mutation);
        // if (mutation.type === "childList") {
        //   console.log("A child node has been added or removed.");
        // } else if (mutation.type === "subtree") {
        //   console.log(
        //     "The " + mutation.attributeName + " attribute was modified."
        //   );
        // }
      }
    });
    observer.observe(document, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const valid = items.length > 0;
  return (
    <host shadowDom>
      <button
        onclick={() => {
          console.log("init");
          init();
        }}
      >
        INIT
      </button>
      <button
        onclick={() => {
          console.log("destroy");
          destroy();
        }}
      >
        DESTROY
      </button>
      {valid ? (
        <div>
          <div class="items" part="items">
            {items.map((item, index) => {
              const { heading, content } = item;
              const expanded = expandedItems[index];
              return AccordionItem({
                active,
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
        </div>
      ) : null}
    </host>
  );
}

Accordion.props = {
  id: {
    // description: Identifies the accordion
    type: String,
    reflect: true,
  },
  icon: {
    // description: Image to use for navigation buttons
    type: String,
    reflect: false,
    value: "https://img.icons8.com/ios-glyphs/452/chevron-right.png",
  },
  expandedIcon: {
    // description: Image to use for navigation buttons when the accordion item is expanded
    type: String,
    reflect: false,
    value: "https://img.icons8.com/ios-glyphs/452/chevron-down.png",
  },
  debug: {
    // hide: true
    // description: Print debug information to the browser console
    type: Boolean,
    reflect: false,
    value: false,
  },
};

customElements.define("codecabana-accordion", c(Accordion));

/* Parts

items
item
expanded
heading
icon
expandedIcon
content

*/
