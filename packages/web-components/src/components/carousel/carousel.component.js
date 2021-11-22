import { c, useEffect, useRef, useState } from "atomico";
import { useSwipe, useStateCb } from "../../lib/hooks";
import { getMatrixTranslateValues } from "../../lib/dom";
import { clamp } from "../../lib/math";
import styles from "./carousel.scss";

function Carousel({
  width = "100%",
  height = "300px",
  itemsPerViewport = 5,
  loop = true,
  swipeable = true,
} = {}) {
  const viewportRef = useRef();
  const trackRef = swipeable
    ? useSwipe({ onSwipeStart, onSwiping, onSwipeEnd })
    : useRef();

  const rawItems = [...Array(10)].map((_, id) => ({ id }));
  const items = loop
    ? [
        ...rawItems.slice(rawItems.length - itemsPerViewport),
        ...rawItems,
        ...rawItems.slice(0, itemsPerViewport),
      ]
    : rawItems;
  const loopStart = itemsPerViewport;

  const [viewportWidth, setViewportWidth] = useState();
  const [itemWidth, setItemWidth] = useState();
  const [activeItem, setActiveItem] = useState(0);
  const [basePosition, setBasePosition] = useStateCb(0); // Position excluding swipe data
  const [swipeDelta, setSwipeDelta] = useState(0); // Pixel length of the current swipe

  const trackWidth = items.length * itemWidth;
  const endEdgePos = trackWidth - viewportWidth;
  const position = clamp(basePosition + swipeDelta, 0, endEdgePos);

  useEffect(updateDimensions, [viewportRef]);
  useEffect(goToLoopStart, [itemWidth]);

  // Initialization
  // ---

  // Updates the viewport and item widths
  function updateDimensions() {
    if (!viewportRef?.current) return;
    const viewportWidth = viewportRef?.current?.clientWidth;
    const itemWidth = viewportWidth / itemsPerViewport;
    setViewportWidth(viewportWidth);
    setItemWidth(itemWidth);
  }

  function goToLoopStart() {
    if (!itemWidth || !loop) return;
    const loopStartPos = getItemPosition(loopStart);
    setBasePosition(loopStartPos);
    setActiveItem(loopStart);
  }

  // Getters
  // ---

  function getItemPosition(index) {
    return index * itemWidth;
  }

  // Swiping
  // ---

  function onSwipeStart() {
    trackRef.current.style.transition = "none";
  }

  function onSwiping({ directions }) {
    const { left, right } = directions;
    const delta = left - right;

    const { atEdge: needsToWrap, atEnd } = isAtEdge();
    if (needsToWrap) {
      setBasePosition(atEnd ? viewportWidth : endEdgePos - viewportWidth);
      setSwipeDelta(0);
    } else setSwipeDelta(delta);
    return needsToWrap;
  }

  function onSwipeEnd() {
    trackRef.current.style.transition = "";
    setBasePosition(clamp(basePosition + swipeDelta, 0, endEdgePos));
    setSwipeDelta(0);
  }

  // Navigation
  // ---

  function isAtEdge() {
    const atStart = position <= 0;
    const atEnd = position >= endEdgePos;
    const atEdge = atStart || atEnd;
    return { atEdge, atStart, atEnd };
  }

  function wrapCurrentPosition() {
    if (!trackRef.current) return;
    const { atEdge, atEnd } = isAtEdge();
    if (!atEdge) return;

    const { x: computedPosition } = getMatrixTranslateValues(
      getComputedStyle(trackRef?.current).getPropertyValue("transform")
    );
    const distanceToEdge = atEnd
      ? trackWidth - (Math.abs(computedPosition) + viewportWidth)
      : Math.abs(computedPosition); // Determine distance to edge of the loop

    // Snap to our current position, but on the other side of the loop
    const snapPosition = atEnd ? viewportWidth : endEdgePos - viewportWidth;
    const immediateItem = atEnd
      ? itemsPerViewport
      : items.length - itemsPerViewport * 2;
    const offsetPosition = atEnd
      ? snapPosition - distanceToEdge
      : snapPosition + distanceToEdge;

    trackRef.current.style.transition = "none"; // Disable transition

    setActiveItem(immediateItem); // Immediately set activeItem to the same item on the other side of loop
    setBasePosition(offsetPosition, () => {
      // Immediately set to the offset position and then wait for next animation frame
      requestAnimationFrame(() => {
        trackRef.current.style.transition = ""; // Re-enable transition

        const moveToPosition = atEnd
          ? snapPosition + itemWidth
          : snapPosition - itemWidth; // Determine the next position to move towards
        const moveToItem = atEnd ? immediateItem + 1 : immediateItem - 1;
        setBasePosition(moveToPosition); // Go to the next item's position
        setActiveItem(moveToItem);
      });
    });
  }

  function adjustActiveItem(count) {
    const { atStart, atEnd } = isAtEdge();
    const goingLeft = Math.sign(count) === -1;
    const goingRight = Math.sign(count) === 1;
    const needsToWrap = (atStart && goingLeft) || (atEnd && goingRight);

    if (needsToWrap) {
      wrapCurrentPosition();
    } else {
      const newItem = clamp(
        activeItem + count,
        0,
        items.length - itemsPerViewport
      );
      const newPos = getItemPosition(newItem);
      setActiveItem(newItem);
      setBasePosition(newPos);
    }
  }

  function onKeyDown(event) {
    if (event.repeat) return;
    if (event.key === "ArrowRight") adjustActiveItem(1);
    else if (event.key === "ArrowLeft") adjustActiveItem(-1);
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
          "--position": `-${position}px`,
        }}
      >
        <div class="track" ref={trackRef}>
          {items.map(({ id }, index) => {
            return (
              <div index={index} class="item">
                {id}
                <img src={`https://source.unsplash.com/random/400x400?${id}`} />
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
