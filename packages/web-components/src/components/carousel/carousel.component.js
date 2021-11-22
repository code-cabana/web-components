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

  function isAtEdge() {
    const atStart = position <= 0;
    const atEnd = position >= trackWidth - viewportWidth;
    const atEdge = atStart || atEnd;
    return { atEdge, atStart, atEnd };
  }

  function onSwipeStart() {
    trackRef.current.style.transition = "none";
  }

  function onSwiping({ directions }) {
    const { left, right } = directions;
    const delta = left - right;

    const { atEdge: needsToWrap, atEnd } = isAtEdge();
    if (needsToWrap)
      setBasePosition(atEnd ? viewportWidth : trackWidth - viewportWidth * 2);
    else setSwipeDelta(delta);
    return needsToWrap;
  }

  function onSwipeEnd() {
    trackRef.current.style.transition = "";
    setBasePosition(
      clamp(basePosition + swipeDelta, 0, trackWidth - viewportWidth)
    );
    setSwipeDelta(0);
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

  const [viewportWidth, setViewportWidth] = useState();
  const [itemWidth, setItemWidth] = useState();
  const [activeItem, setActiveItem] = useState(0);
  const [basePosition, setBasePosition] = useStateCb(0);
  const [swipeDelta, setSwipeDelta] = useState(0);

  const trackWidth = items.length * itemWidth;
  const position = clamp(
    basePosition + swipeDelta,
    0,
    trackWidth - viewportWidth
  );

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
    if (!itemWidth || !loop) return;
    const loopStartPos = getItemPosition(loopStart);
    setBasePosition(loopStartPos);
    setActiveItem(loopStart);
  }

  useEffect(updateDimensions, [viewportRef]);
  useEffect(goToLoopStart, [itemWidth]);

  // Arrow key navigation
  function onKeyDown(event) {
    if (event.repeat) return;
    const { atStart, atEnd } = isAtEdge();
    const goingLeft = event.key === "ArrowLeft";
    const goingRight = event.key === "ArrowRight";
    const needsToWrap = (atStart && goingLeft) || (atEnd && goingRight);

    if (needsToWrap) {
      // Determine distance to edge of the loop
      const { x: computedPosition } = getMatrixTranslateValues(
        getComputedStyle(trackRef?.current).getPropertyValue("transform")
      );
      const distanceToEdge = atStart
        ? Math.abs(computedPosition)
        : trackWidth - (Math.abs(computedPosition) + viewportWidth);

      // Snap to our current position, but on the other side of the loop
      const immediatePosition = atEnd
        ? viewportWidth
        : trackWidth - viewportWidth * 2;
      const immediateItem = atEnd
        ? itemsPerViewport
        : items.length - itemsPerViewport * 2;
      const offsetPosition = atEnd
        ? immediatePosition - distanceToEdge
        : immediatePosition + distanceToEdge;
      setActiveItem(immediateItem);
      setBasePosition(offsetPosition, () => {
        trackRef.current.style.transition = "none"; // Disable transition
        requestAnimationFrame(() => {
          trackRef.current.style.transition = ""; //Re-enable transition
          // Determine the next position to move towards
          const moveToPosition = atEnd
            ? immediatePosition + itemWidth
            : immediatePosition - itemWidth;
          const moveToItem = atEnd ? immediateItem + 1 : immediateItem - 1;
          setBasePosition(moveToPosition);
          setActiveItem(moveToItem);
        });
      });
    } else {
      if (goingRight) adjustActiveItem(1);
      else if (goingLeft) adjustActiveItem(-1);
    }
  }

  function adjustActiveItem(count) {
    const newItem = clamp(
      activeItem + count,
      0,
      items.length - itemsPerViewport
    );
    const newPos = getItemPosition(newItem);
    setActiveItem(newItem);
    setBasePosition(newPos);
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
