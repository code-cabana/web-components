import { c, useEffect, useHost, useRef, useState } from "atomico";
import { useSlot } from "@atomico/hooks/use-slot";
import { getMatrixTranslateValues, renderHtml } from "../../lib/dom";
import { useSwipe, useStateCb, useEventListener } from "../../lib/hooks";
import { clamp } from "../../lib/math";
import styles from "./carousel.scss";

// Todo
// Use velocity based momentum rather than time threshold
// Navigators
// Navigator icon
// Flip navigators
// Transition duration
// Transition easing
// Start slide
// onChange function
// parts styling

function Carousel({
  width = "50%", // Width of the viewport
  height = "300px", // Height of the viewport
  itemsPerViewport: _itemsPerViewport = 5, // How many items to display per viewport width
  loop = true, // When reaching the start or end, loop back to the beginning?
  swipeable = true, // Dragging or swiping the carousel moves it
  useMomentum = true, // When finishing a swipe, preserve momentum
  momentumMultiplier = 1.5, // Drift further after ending a swipe
  snap = true, // When completing a swipe, snap to the nearest item
  reverse = false, // Reverse the display order of items
  dragThreshold = 200, // Time in millis that a swipe (preserves momentum) becomes a drag (no momentum)
  minSwipeDistance = 50, // Minimum swipe distance required in pixels to use momentum
} = {}) {
  const host = useHost();
  const slotRef = useRef();
  const itemNodes = useSlot(slotRef);
  const viewportRef = useRef();
  const trackRef = swipeable
    ? useSwipe({ onSwipeStart, onSwiping, onSwipeEnd })
    : useRef();

  const [viewportWidth, setViewportWidth] = useState();
  const [itemWidth, setItemWidth] = useState();
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState(0);
  const [basePosition, setBasePosition] = useStateCb(0); // Position excluding swipe data
  const [swipeDelta, setSwipeDelta] = useState(0); // Pixel length of the current swipe

  const itemsPerViewport = getItemsPerViewport();
  const loopStart = itemsPerViewport;
  const trackWidth = items.length * itemWidth;
  const endEdgePos = trackWidth - viewportWidth;
  const position = clamp(basePosition + swipeDelta, 0, endEdgePos);

  useEffect(updateDimensions, [viewportRef, items]);
  useEffect(buildItems, [itemNodes]);
  useEffect(goToLoopStart, [items, itemWidth]);
  useEventListener("resize", onResize, window);

  // Initialization
  // ---

  // Builds all items provided to the items slot
  function buildItems() {
    if (!itemNodes || itemNodes.length <= 0) return;

    const enhancedItems = itemNodes
      .filter((el) => el instanceof Element)
      .map(buildItem);

    // If direction is right to left, flip the array
    const itemsReversed = reverse
      ? [...enhancedItems].reverse()
      : enhancedItems;

    // If looping is required, add the first page to the end and last page to the beginning
    const loopedItems = loop
      ? [
          ...itemsReversed.slice(itemsReversed.length - itemsPerViewport),
          ...itemsReversed,
          ...itemsReversed.slice(0, itemsPerViewport),
        ]
      : itemsReversed;

    setItems(loopedItems);
  }

  // Builds an individual item
  function buildItem(itemNode) {
    const clone = itemNode.cloneNode(true);
    clone.setAttribute("class", "item");
    return renderHtml(clone.outerHTML);
  }

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

  function onResize() {
    updateDimensions();
  }

  // Getters
  // ---

  function getItemPosition(index) {
    return index * itemWidth;
  }

  // Derive number of slides per page based on --perPage CSS variable or fall back to passed property
  function getItemsPerViewport() {
    if (!host?.current) return _itemsPerViewport;
    const style = getComputedStyle(host.current)?.getPropertyValue("--perPage");
    if (!style) return _itemsPerViewport;
    const perPageNum = parseInt(style);
    return typeof perPageNum === "number" ? perPageNum : _itemsPerViewport;
  }

  // Swiping
  // ---

  function onSwipeStart() {
    trackRef.current.style.transition = "none";
  }

  function onSwiping({ directions }) {
    const { left, right } = directions;
    const delta = left - right;
    const { atEdge, atEnd } = isAtEdge();
    const needsToWrap = loop && atEdge;
    if (needsToWrap) {
      setBasePosition(atEnd ? viewportWidth : endEdgePos - viewportWidth);
      setSwipeDelta(0);
    } else setSwipeDelta(delta);
    return needsToWrap;
  }

  function onSwipeEnd({
    totalDirection,
    directions,
    totalDirections,
    totalTime: time,
  }) {
    const { left, right } = directions;
    const { left: totalLeft, right: totalRight } = totalDirections;
    const delta = left - right;
    const totalDelta = totalLeft - totalRight;

    trackRef.current.style.transition = "";

    // Momentum
    const hasMomentum =
      time < dragThreshold && Math.abs(totalDelta) > minSwipeDistance;
    const momentumOffset =
      useMomentum && hasMomentum
        ? clamp(
            totalDelta * momentumMultiplier,
            totalDirection === "right" ? -1 * viewportWidth : 0,
            totalDirection === "right" ? 0 : viewportWidth
          ) // Clamp between -1 viewport width or +1 viewport width, depending on travel direction
        : 0;

    const newPos = clamp(basePosition + delta + momentumOffset, 0, endEdgePos);
    const closestItem = Math.abs(Math.round(newPos / itemWidth));
    setActiveItem(closestItem);
    setSwipeDelta(0);

    if (snap) setBasePosition(getItemPosition(closestItem));
    else setBasePosition(newPos);
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
    if (!loop || !trackRef.current) return;
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
    if (event.repeat && loop) return;
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
          "--position": `-${position}px`,
          "--itemWidth":
            typeof itemWidth !== "undefined"
              ? `${itemWidth}px`
              : `${viewportWidth}px`,
        }}
      >
        <div class="track" ref={trackRef}>
          <slot ref={slotRef} name="item" />
          {items}
        </div>
      </div>
      <style>{styles}</style>
    </host>
  );
}

Carousel.props = {};

customElements.define("codecabana-carousel", c(Carousel));
