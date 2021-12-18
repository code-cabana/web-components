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
    width,
    height,
    itemsPerViewport: _itemsPerViewport,
    startItem: _startItem,
    loop,
    autoplay,
    autoplayInterval,
    autoplayDirection,
    autoplayPauseOnFocus,
    swipeable,
    useMomentum,
    momentumMultiplier,
    snap,
    reverse,
    dragThreshold,
    minSwipeDistance,
    icon,
    flipNav,
    duration,
    easing,
    onChange,
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
  const [focused, setFocused] = useState(false);
  const [autoplayTicks, setAutoplayTicks] = useState(0);

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
  useEffect(initAutoplayCycle, [autoplay, items]);
  useEffect(onAutoplayCycle, [autoplayTicks]);
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
      // Immediately set to the offset position and then wait for next 2 animation frames
      requestAnimationFrame(() => {
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
    });
  }

  function adjustActiveItem(count) {
    const { atStart, atEnd } = isAtEdge();
    const goingLeft = Math.sign(count) === -1;
    const goingRight = Math.sign(count) === 1;
    const needsToWrap = (atStart && goingLeft) || (atEnd && goingRight);

    console.log(needsToWrap);
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

  function onAutoplayCycle() {
    if (!autoplay) return;
    if (autoplayPauseOnFocus && focused) return;
    if (autoplayDirection === "left") adjustActiveItem(-1);
    else adjustActiveItem(1);
  }

  function initAutoplayCycle() {
    if (!autoplay) return;
    const autoplayIntervalRef = setInterval(() => {
      setAutoplayTicks((prevTicks) => prevTicks + 1);
    }, autoplayInterval);
    return () => clearInterval(autoplayIntervalRef);
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
    <host
      shadowDom
      tabindex={0}
      onclick={onClick}
      onkeydown={onKeyDown}
      onfocus={() => setFocused(true)}
      onblur={() => setFocused(false)}
    >
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
    // description: Width of the carousel viewport
    type: String,
    value: "100%",
  },
  height: {
    // description: Height of the carousel viewport
    type: String,
    value: "600px",
  },
  itemsPerViewport: {
    // description: How many items to display per viewport width
    type: Number,
    value: 3,
  },
  startItem: {
    // description: Item to show on page load
    type: Number,
    value: 0,
  },
  loop: {
    // description: When reaching the start or end, loop back to the beginning?
    type: Boolean,
    value: true,
  },
  autoplay: {
    // description: Automatically cycle through items
    type: Boolean,
    value: true,
  },
  autoplayInterval: {
    // description: Time in milliseconds to wait before cycling to the next item
    type: Number,
    value: 3000,
  },
  autoplayDirection: {
    // description: Direction to cycle through items
    type: String,
    value: "right",
  },
  autoplayPauseOnFocus: {
    // description: Pause autoplay when the carousel is focused
    type: Boolean,
    value: true,
  },
  swipeable: {
    // description: Dragging or swiping the carousel moves it
    type: Boolean,
    value: true,
  },
  useMomentum: {
    // description: When finishing a swipe, preserve momentum
    type: Boolean,
    value: true,
  },
  momentumMultiplier: {
    // description: Drift further after ending a swipe
    type: Number,
    value: 1.5,
  },
  snap: {
    // description: When completing a swipe, snap to the nearest item
    type: Boolean,
    value: true,
  },
  reverse: {
    // description: Reverse the display order of items
    type: Boolean,
    value: false,
  },
  dragThreshold: {
    // description: Time in millis that a swipe (preserves momentum) becomes a drag (no momentum)
    type: Number,
    value: 200,
  },
  minSwipeDistance: {
    // description: Minimum swipe distance required in pixels to use momentum
    type: Number,
    value: 50,
  },
  icon: {
    // description: Image used for navigator buttons
    type: String,
    value: "https://unpkg.com/@codecabana/assets@latest/img/arrow.png",
  },
  flipNav: {
    // description: Reverse the direction of the navigator buttons
    type: Boolean,
    value: false,
  },
  duration: {
    // description: Transition duration in millis
    type: Number,
    value: 300,
  },
  easing: {
    // description: Transition easing - See here for more info: https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function
    type: String,
    value: "ease-out",
  },
  onChange: {
    // hide: true
    // description: Called when the current item changes
    type: Function,
    value: () => {},
  },
};

customElements.define("codecabana-carousel", c(Carousel));
