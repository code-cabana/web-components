import { renderHtml } from "../../lib/dom";
import { cssJoin } from "../../lib/array";
import collapse from "../../lib/collapse";
import { useEffect, useRef, useState } from "atomico/core";

export default function AccordionItem({
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
  }, [contentRef]);

  useEffect(() => {
    const { update } = collapseRef;
    if (!update) return;
    update({ open: expanded });
  }, [collapseRef, expanded]);

  function onClick() {
    setExpanded(!expanded);
  }

  return (
    <div class={cssJoin(["item", expanded && "expanded"])}>
      <button
        class="heading"
        onclick={onClick}
        aria-expanded={expanded}
        aria-haspopup={true}
      >
        {renderHtml(heading)}
        <img class="icon" src={icon} alt="" />
        <img class="expandedIcon" src={expandedIcon} alt="" />
      </button>
      <div class="content" ref={contentRef}>
        {renderHtml(content)}
      </div>
    </div>
  );
}
