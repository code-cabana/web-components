import { c, useEffect, useRef, useState } from "atomico";
import { useAnimationFrame, useSwipe } from "../../lib/hooks";
import { isDefined } from "../../lib/array";
import { clamp } from "../../lib/math";
import styles from "./carousel.scss";

function Carousel({
  width = "50%",
  height = "300px",
  itemsPerViewport = 2,
  loop = true,
  swipeable = true,
} = {}) {
  const viewportRef = useRef();
  const trackRef = swipeable
    ? useSwipe({ onSwipeStart, onSwiping, onSwipeEnd })
    : useRef();

  const swipeDeltaR = useRef(0);
  const [swipeDeltaS, setSwipeDeltaS] = useState(0);

  const targetPosR = useRef(0);
  const [targetPosS, setTargetPosS] = useState(0);
  const animPosR = useRef(0);
  const [animPosS, setAnimPosS] = useState(0);
  const itemWidthR = useRef();
  const [itemWidthS, setItemWidthS] = useState();
  const targetPos = targetPosR?.current || 0; // Component position target - does not consider browser animation frames
  const animPos = animPosR?.current || 0; // Browser position target - only updated in sync with browser animation frames
  const swipeDelta = swipeDeltaR?.current || 0;
  const itemWidth = itemWidthR?.current;

  function setSwipeDelta(newDelta) {
    swipeDeltaR.current = newDelta;
    setSwipeDeltaS(newDelta);
  }

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
    const swipeDelta = swipeDeltaR?.current;
    const viewportWidth = getViewportWidth();
    if (!isDefined(targetPos) || !isDefined(animPos) || !isDefined(swipeDelta))
      return;
    const desiredPos = targetPos + swipeDelta;
    if (animPos === desiredPos) return; // If the position hasn't changed, do nothing

    const loopEndPos = loopEnd * itemWidth;
    const inWarpStart = desiredPos <= clampStart;
    const inWarpEnd = desiredPos >= loopEndPos;

    if (loop && (inWarpStart || inWarpEnd)) {
      const startWarpToPos = (loopEnd + 1) * itemWidth - viewportWidth;
      const endWarpToPos = (loopStart - 1) * itemWidth;
      const currentPos = inWarpStart ? startWarpToPos : endWarpToPos;
      const newTargetPos =
        currentPos + (inWarpStart ? -1 * itemWidth : itemWidth);
      const newTargetItem = Math.abs(Math.round(newTargetPos / itemWidth));
      setAnimPos(currentPos);
      setTargetPos(newTargetPos);
      setTargetItem(newTargetItem);
      trackRef.current.style.transition = "none";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          trackRef.current.style.transition = "";
        });
      });
    } else {
      setAnimPos(desiredPos + swipeDelta);
    }
  });

  function onSwipeStart() {
    // console.log("swipe start")
  }

  function onSwiping({ directions }) {
    const { left, right } = directions;
    const delta = left - right;
    setSwipeDelta(delta);
  }

  function onSwipeEnd() {
    setSwipeDelta(0);
    setTargetPos(animPos + swipeDelta);
    console.log(itemWidth, targetPos, animPos, targetPos + swipeDelta);
    // console.log("Swipe end", targetPos);
  }

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
          "--swipeDelta": `${swipeDelta}px`,
        }}
      >
        <div class="track" ref={trackRef}>
          {items.map(({ id }, index) => {
            return (
              <div index={index} class="item">
                {id}
                <img src={`https://source.unsplash.com/random/200x400?${id}`} />
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
