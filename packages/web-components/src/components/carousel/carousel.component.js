import { c, useEffect, useRef, useState } from "atomico";
import { useAnimationFrame } from "../../lib/hooks";
import { isDefined } from "../../lib/array";
import { clamp } from "../../lib/math";
import styles from "./carousel.scss";

function Carousel({
  width = "100%",
  height = "300px",
  itemsPerViewport = 5,
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
  const targetPos = targetPosR?.current || 0; // Component position target - does not consider browser animation frames
  const animPos = animPosR?.current || 0; // Browser position target - only updated in sync with browser animation frames
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
        ...rawItems.slice(rawItems.length - itemsPerViewport),
        ...rawItems,
        ...rawItems.slice(0, itemsPerViewport),
      ]
    : rawItems;
  const loopStart = itemsPerViewport;
  const loopEnd = items.length - itemsPerViewport;
  const clampStart = 0;
  const clampEnd = items.length - itemsPerViewport;

  const [viewportWidth, setViewportWidth] = useState();
  const [targetItem, setTargetItem] = useState(loop ? loopStart : 0);
  const position = typeof animPos !== "undefined" ? `-${animPos}px` : "0px";

  function getViewportWidth() {
    return viewportRef?.current?.clientWidth;
  }

  // Updates the viewport and item widths
  function updateDimensions() {
    if (!viewportRef?.current) return;
    const viewportWidth = getViewportWidth();
    const itemWidth = viewportWidth / itemsPerViewport;
    setViewportWidth(viewportWidth);
    setItemWidth(itemWidth);
  }

  function goToLoopStart() {
    if (!itemWidth) return;
    const loopStartPos = getItemPosition(loopStart);
    setTargetPos(loopStartPos);
  }

  useEffect(updateDimensions, [viewportRef]);
  useEffect(goToLoopStart, [itemWidth]);

  useAnimationFrame(() => {
    if (!trackRef?.current) return; // If the track is not yet rendered, do nothing
    const targetPos = targetPosR?.current;
    const animPos = animPosR?.current;
    const itemWidth = itemWidthR?.current;
    const viewportWidth = getViewportWidth();
    if (!isDefined(targetPos) || !isDefined(animPos)) return;
    if (animPos === targetPos) return; // If the position hasn't changed, do nothing

    if (loop) {
      const loopEndPos = loopEnd * itemWidth;
      const inWarpStart = targetPos <= clampStart;
      const inWarpEnd = targetPos >= loopEndPos;
      if (inWarpStart || inWarpEnd) {
        const startWarpToPos = (loopEnd + 1) * itemWidth - viewportWidth;
        const endWarpToPos = (loopStart - 1) * itemWidth;
        const warpedPos = inWarpStart ? startWarpToPos : endWarpToPos;
        const newTargetPos =
          warpedPos + (inWarpStart ? -1 * itemWidth : itemWidth);
        const newTargetItem = Math.abs(Math.round(newTargetPos / itemWidth));
        setAnimPos(warpedPos);
        setTargetPos(newTargetPos);
        setTargetItem(newTargetItem);
        trackRef.current.style.transition = "none";
        requestAnimationFrame(() => {
          trackRef.current.style.transition = "";
        });
      } else {
        setAnimPos(targetPos);
      }
    } else {
      setAnimPos(targetPos);
    }
  });

  console.log("targetPos", targetPos, "targetItem", targetItem);

  // Arrow key navigation
  function onKeyDown(event) {
    // if (event.repeat) return;
    if (event.key === "ArrowRight") adjustTargetItem(1);
    else if (event.key === "ArrowLeft") adjustTargetItem(-1);
  }

  function adjustTargetItem(count) {
    const newItem = clamp(targetItem + count, clampStart, clampEnd);
    const newPos = getItemPosition(newItem);
    setTargetItem(newItem);
    setTargetPos(newPos);
  }

  function getItemPosition(index) {
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
          "--position": position,
        }}
      >
        <div class="track" ref={trackRef}>
          {items.map(({ id }, index) => {
            return (
              <div index={index} class="item">
                {id}
                <img src={`https://source.unsplash.com/random/400x300?${id}`} />
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
