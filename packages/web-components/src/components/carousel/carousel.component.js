import { c, useEffect, useHost, useRef, useState } from "atomico";
import { useSlot } from "@atomico/hooks/use-slot";
import { getMatrixTranslateValues, renderHtml } from "../../lib/dom";
import { useSwipe, useStateCb, useEventListener } from "../../lib/hooks";
import { cssJoin } from "../../lib/array";
import { clamp } from "../../lib/math";
import Navigators from "./navigators";
import styles from "./carousel.scss";

function Carousel(props = {}) {
  const {
    width, // Width of the viewport
    height, // Height of the viewport
    itemsPerViewport: _itemsPerViewport, // How many items to display per viewport width
    startItem: _startItem, // Item to show on page load
    loop, // When reaching the start or end, loop back to the beginning?
    swipeable, // Dragging or swiping the carousel moves it
    useMomentum, // When finishing a swipe, preserve momentum
    momentumMultiplier, // Drift further after ending a swipe
    snap, // When completing a swipe, snap to the nearest item
    reverse, // Reverse the display order of items
    dragThreshold, // Time in millis that a swipe (preserves momentum) becomes a drag (no momentum)
    minSwipeDistance, // Minimum swipe distance required in pixels to use momentum
    icon, // Image used for navigator buttons
    flipNav, // Reverse the direction of the navigator buttons
    duration, // Transition duration in millis
    easing, // Transition easing
    onChange, // Called when the current item changes
  } = props;
  const allProps = Object.values(props);

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
  const [itemsPerViewport, setItemsPerViewport] = useState(1);
  const [activeItem, setActiveItem] = useState(0);
  const [basePosition, setBasePosition] = useStateCb(0); // Position excluding swipe data
  const [swipeDelta, setSwipeDelta] = useState(0); // Pixel length of the current swipe

  const loopStart = itemsPerViewport;
  const trackWidth = items.length * itemWidth;
  const endEdgePos = trackWidth - viewportWidth;
  const position = clamp(basePosition + swipeDelta, 0, endEdgePos);

  const atStart = !loop && activeItem === 0;
  const atEnd = !loop && activeItem === items.length - itemsPerViewport;

  useEffect(updateDimensions, [...allProps, viewportRef, items]);
  useEffect(buildItems, [itemNodes, itemsPerViewport]);
  useEffect(goToStartItem, [items, itemWidth]);
  useEffect(onChange, [activeItem]);
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
    clone.setAttribute("part", "item");
    return renderHtml(clone.outerHTML);
  }

  // Updates the viewport and item widths
  function updateDimensions() {
    if (!viewportRef?.current) return;
    const viewportWidth = viewportRef?.current?.clientWidth;
    const itemWidth = viewportWidth / itemsPerViewport;
    setViewportWidth(viewportWidth);
    setItemWidth(itemWidth);
    setItemsPerViewport(getItemsPerViewport());
  }

  function goToStartItem() {
    if (!itemWidth) return;
    const startItem = loop ? loopStart + _startItem : _startItem;
    const startItemPos = getItemPosition(startItem);
    setBasePosition(startItemPos);
    setActiveItem(startItem);
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
    const style = getComputedStyle(host.current)?.getPropertyValue(
      "--itemsPerViewport"
    );
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
    const atStart = parseInt(position) <= 0;
    const atEnd = parseInt(position) >= parseInt(endEdgePos);
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

  function onClick() {
    if (!host?.current) return;
    host.current.focus();
  }

  function onKeyDown(event) {
    if (event.repeat && loop) return;
    if (event.key === "ArrowRight") adjustActiveItem(1);
    else if (event.key === "ArrowLeft") adjustActiveItem(-1);
  }

  return (
    <host shadowDom tabindex={0} onclick={onClick} onkeydown={onKeyDown}>
      <div
        class={cssJoin(["viewport", swipeable && "swipeable"])}
        part="viewport"
        ref={viewportRef}
        style={{
          "--width": width,
          "--height": height,
          "--position": `-${position}px`,
          "--duration": `${duration / 1000}s`,
          "--easing": easing,
          "--itemWidth":
            typeof itemWidth !== "undefined"
              ? `${itemWidth}px`
              : `${viewportWidth}px`,
        }}
      >
        <div class="track" part="track" ref={trackRef}>
          <slot ref={slotRef} name="item" />
          {items}
        </div>
        {Navigators({ adjustActiveItem, icon, flipNav, atStart, atEnd })}
      </div>
      <style>{styles}</style>
    </host>
  );
}

Carousel.props = {
  width: {
    type: String, // Width of the carousel viewport
    value: "100%",
  },
  height: {
    type: String, // Height of the carousel viewport
    value: "600px",
  },
  itemsPerViewport: {
    type: Number, // How many items to display per viewport width
    value: 3,
  },
  startItem: {
    type: Number, // Item to show on page load
    value: 0,
  },
  loop: {
    type: Boolean, // When reaching the start or end, loop back to the beginning?
    value: true,
  },
  swipeable: {
    type: Boolean, // Dragging or swiping the carousel moves it
    value: true,
  },
  useMomentum: {
    type: Boolean, // When finishing a swipe, preserve momentum
    value: true,
  },
  momentumMultiplier: {
    type: Number, // Drift further after ending a swipe
    value: 1.5,
  },
  snap: {
    type: Boolean, // When completing a swipe, snap to the nearest item
    value: true,
  },
  reverse: {
    type: Boolean, // Reverse the display order of items
    value: false,
  },
  dragThreshold: {
    type: Number, // Time in millis that a swipe (preserves momentum) becomes a drag (no momentum)
    value: 200,
  },
  minSwipeDistance: {
    type: Number, // Minimum swipe distance required in pixels to use momentum
    value: 50,
  },
  icon: {
    type: String, // Image used for navigator buttons
    value: "https://unpkg.com/@codecabana/assets@latest/img/arrow.png",
  },
  flipNav: {
    type: Boolean, // Reverse the direction of the navigator buttons
    value: false,
  },
  duration: {
    type: Number, // Transition duration in millis
    value: 300,
  },
  easing: {
    type: String, // Transition easing - https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function
    value: "ease-out",
  },
  onChange: {
    type: Function, // Called when the current item changes
    value: () => {},
  },
};

customElements.define("codecabana-carousel", c(Carousel));
