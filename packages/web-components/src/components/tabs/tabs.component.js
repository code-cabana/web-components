import { c, useEffect, useRef, useState } from "atomico";
import { useSlot } from "@atomico/hooks/use-slot";
import { cssJoin } from "../../lib/array";
import { renderHtml } from "../../lib/dom";
import styles from "./tabs.scss";

function Tabs({
  id,
  height,
  minHeight,
  backgroundColor,
  titleMaxWidth,
  contentMaxWidth,
}) {
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
      const visible = index === activeTab;
      return (
        <button
          role="tab"
          id={title}
          class={cssJoin(["title", visible && "active"])}
          part={cssJoin(["title", visible && "title-active"])}
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
          class={cssJoin(["content", visible && "active"])}
          part={cssJoin(["content", visible && "content-active"])}
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
    <host
      shadowDom
      style={{
        "--height": height,
        "--min-height": minHeight,
        "--background-color": backgroundColor,
        "--title-max-width": titleMaxWidth,
        "--content-max-width": contentMaxWidth,
      }}
    >
      <slot ref={slotRef} />
      <div class="titles" part="titles" role="tablist" aria-label={id}>
        {titles}
      </div>
      <div class="contents" part="contents">
        {contents}
      </div>
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
  height: {
    // description: Height of the tabs component. Use this instead of "min-height" if you don't want tabs to expand based on their content. Any valid CSS unit is accepted
    type: String,
    value: "auto",
  },
  minHeight: {
    // description: Minimum height of the tabs component. Use this instead of "height" if you do want tabs to expand based on their content. Any valid CSS unit is accepted
    type: String,
    value: "300px",
  },
  backgroundColor: {
    // description: Self explanatory
    type: String,
    value: "transparent",
  },
  titleMaxWidth: {
    // description: The maximum width of any title. Any valid CSS unit is accepted
    type: String,
    value: "auto",
  },
  contentMaxWidth: {
    // description: The maximum width of any tab content. Any valid CSS unit is accepted
    type: String,
    value: "600px",
  },
};

customElements.define("codecabana-tabs", c(Tabs));
