import { renderHtml } from "../../lib/dom";
import { cssJoin } from "../../lib/array";
import { collapse } from "../../lib/animation";
import { useEffect, useRef, useState } from "atomico/core";

export default function AccordionItem({
  active,
  heading,
  content,
  icon,
  expandedIcon,
  expanded,
  setExpanded,
}) {
  const contentRef = useRef();
  const [collapseRef, setCollapseRef] = useState({});

  useEffect(() => {
    if (!contentRef.current) return;
    const { update, destroy } = collapse(contentRef.current, { open: false });
    setCollapseRef({ update, destroy });
    return destroy;
  }, [contentRef, active]);

  useEffect(() => {
    const { update } = collapseRef;
    if (!update) return;
    update({ open: expanded });
  }, [collapseRef, expanded]);

  function onClick() {
    setExpanded(!expanded);
  }

  return (
    <div
      class={cssJoin(["item", expanded && "expanded"])}
      part={cssJoin(["item", expanded && "expanded"])}
    >
      <button
        class="heading"
        part="heading"
        onclick={onClick}
        aria-expanded={expanded}
        aria-haspopup={true}
      >
        {renderHtml(heading)}
        <img class="icon" part="icon" src={icon} alt="" />
        <img
          class="expandedIcon"
          part="expandedIcon"
          src={expandedIcon}
          alt=""
        />
      </button>
      <div class="content" part="content" ref={contentRef}>
        {renderHtml(content)}
      </div>
    </div>
  );
}
