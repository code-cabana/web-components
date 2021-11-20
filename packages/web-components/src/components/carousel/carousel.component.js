import { c, useEffect, useRef, useState } from "atomico";
import { useAnimationFrame } from "../../lib/hooks";
import { isDefined } from "../../lib/array";
import { clamp } from "../../lib/math";
import styles from "./carousel.scss";

function Carousel({
  width = "400px",
  height = "300px",
  itemsPerPage = 5,
  loop = true,
} = {}) {
  const viewportRef = useRef();
  const trackRef = useRef();

  const targetPosR = useRef(0);
  const [targetPosS, setTargetPosS] = useState(0);
  const animPosR = useRef(0);
  const [animPosS, setAnimPosS] = useState(0);
  const itemWidthR = useRef();
  const [itemWidthS, setItemWidthS] = useState();
  const targetPos = targetPosR?.current || 0;
  const animPos = animPosR?.current || 0;
  const itemWidth = itemWidthR?.current;

  function setTargetPos(newPos) {
    targetPosR.current = newPos;
    setTargetPosS(newPos);
  }

  function setAnimPos(newPos) {
    animPosR.current = newPos;
    setAnimPosS(newPos);
  }

  function setItemWidth(newWidth) {
    itemWidthR.current = newWidth;
    setItemWidthS(newWidth);
  }

  const rawItems = [...Array(10)].map((_, id) => ({ id }));
  const items = loop
    ? [
        ...rawItems.slice(rawItems.length - itemsPerPage),
        ...rawItems,
        ...rawItems.slice(0, itemsPerPage),
      ]
    : rawItems;
  const loopStart = itemsPerPage;
  const loopEnd = items.length - itemsPerPage;
  const clampStart = 0;
  const clampEnd = items.length - itemsPerPage;

  const [viewportWidth, setViewportWidth] = useState();
  const [targetItem, setTargetItem] = useState(loop ? loopStart : 0);
  const position = typeof animPos !== "undefined" ? `-${animPos}px` : "0px";

  // Updates the viewport and item widths
  function updateDimensions() {
    if (!viewportRef?.current) return;
    const viewportWidth = viewportRef.current.clientWidth;
    const itemWidth = viewportWidth / itemsPerPage;
    setViewportWidth(viewportWidth);
    setItemWidth(itemWidth);
  }

  function goToLoopStart() {
    if (!itemWidth) return;
    const loopStartPos = getSlidePosition(loopStart);
    setTargetPos(loopStartPos);
  }

  useEffect(updateDimensions, [viewportRef]);
  useEffect(goToLoopStart, [itemWidth]);

  useAnimationFrame(() => {
    if (!trackRef?.current) return; // If the track is not yet rendered, do nothing
    const targetPos = targetPosR?.current;
    const animPos = animPosR?.current;
    const itemWidth = itemWidthR?.current;
    if (!isDefined(targetPos) || !isDefined(animPos)) return;
    if (animPos === targetPos) return; // If the position hasn't changed, do nothing

    if (loop) {
      const loopEndPos = loopEnd * itemWidth;
      const inWarpZone = targetPos <= clampStart || targetPos >= loopEndPos;
      if (inWarpZone) {
        // UP TO: need to snap back to start / end of the loop
        setAnimPos(targetPos);
      } else {
        setAnimPos(targetPos);
      }
    } else {
      setAnimPos(targetPos);
    }
  });

  // Arrow key navigation
  function onKeyDown(event) {
    // if (event.repeat) return;
    if (event.key === "ArrowRight") adjustTargetItem(1);
    else if (event.key === "ArrowLeft") adjustTargetItem(-1);
  }

  function adjustTargetItem(count) {
    const newItem = clamp(targetItem + count, clampStart, clampEnd);
    const newPos = getSlidePosition(newItem);
    setTargetItem(newItem);
    setTargetPos(newPos);
  }

  function getSlidePosition(index) {
    return index * itemWidth;
  }

  return (
    <host shadowDom>
      <div
        class="viewport"
        ref={viewportRef}
        tabindex={0}
        onkeydown={onKeyDown}
        style={{
          "--width": width,
          "--height": height,
          "--itemWidth":
            typeof itemWidth !== "undefined"
              ? `${itemWidth}px`
              : `${viewportWidth}px`,
          "--targetPos": `${targetPos}px`,
          "--position": position,
        }}
      >
        <div class="track" ref={trackRef}>
          {items.map(({ id }, index) => {
            return (
              <div index={index} class="item">
                {id}
              </div>
            );
          })}
        </div>
      </div>
      <style>{styles}</style>
    </host>
  );
}

Carousel.props = {};

customElements.define("codecabana-carousel", c(Carousel));
