import { c, useEffect, useRef, useState } from "atomico";
import { useSlot } from "@atomico/hooks/use-slot";
import styles from "./tabs.scss";
import { renderHtml } from "../../lib/dom";

function Tabs({ id }) {
  const slotRef = useRef();
  const rawItems = useSlot(slotRef);
  const items = rawItems.filter((el) => el instanceof HTMLElement);
  const [activeTab, setActiveTab] = useState(0);
  const [titles, setTitles] = useState();
  const [contents, setContents] = useState();

  function onClick(event) {
    const clickedIndex = event.target.getAttribute("data-index");
    if (typeof clickedIndex !== "string") return;
    setActiveTab(parseInt(clickedIndex));
  }

  function rebuild() {
    const titles = items.map((el, index) => {
      const title = el.getAttribute("title") || "Missing title";
      return (
        <button
          role="tab"
          id={title}
          data-index={index}
          aria-selected="false"
          aria-controls={`${title}-tab`}
          onclick={onClick}
        >
          {title}
        </button>
      );
    });

    const contents = items.map((el, index) => {
      const title = el.getAttribute("title") || "Missing title";
      const visible = index === activeTab;
      return (
        <div
          id={`${title}-tab`}
          data-index={index}
          tabindex={visible ? 0 : undefined}
          role="tabpanel"
          aria-labelledby={title}
          aria-selected={visible ? "true" : undefined}
          hidden={visible ? undefined : "true"}
        >
          {renderHtml(el.innerHTML)}
        </div>
      );
    });

    setTitles(titles);
    setContents(contents);
  }

  useEffect(rebuild, [rawItems, activeTab]);

  return (
    <host shadowDom>
      <slot ref={slotRef} />
      <div role="tablist" aria-label={id}>
        {titles}
      </div>
      {contents}
      <style>{styles}</style>
    </host>
  );
}

Tabs.props = {
  id: {
    // description: Distinguishes this tabs component from others. Make sure this is different between tabs components if you use more than one
    type: String,
    value: "tabs",
  },
};

customElements.define("codecabana-tabs", c(Tabs));
