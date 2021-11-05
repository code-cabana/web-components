import { c, useEffect, useHost, useRef, useState } from "atomico";
import { useEventListener, useSwipe, useOnClickOutside } from "../../lib/hooks";
import { useSlot } from "@atomico/hooks/use-slot";
import { nextFrame } from "../../lib/animation";
import { getMatrixTranslateValues, renderHtml } from "../../lib/dom";
import { cssJoin } from "../../lib/array";
import { clamp } from "../../lib/math";
import Navigators from "./navigators";
import styles from "./carousel.scss";

function Carousel({
  width: _width,
  height,
  loop,
  icon,
  flipnav,
  reverse,
  dragthreshold,
  easing,
  duration,
  startslide,
  swipeable,
  onchange = () => {},
} = {}) {
  // Refs
  const host = useHost();
  const carouselRef = useRef();
  const slotRef = useRef();
  const childNodes = useSlot(slotRef);
  const trackRef = swipeable
    ? useSwipe({ onSwipeStart, onSwiping, onSwipeEnd })
    : undefined;

  // State
  const [width, setWidth] = useState(0);
  const [slides, setSlides] = useState();
  const [transition, setTransition] = useState(true);
  const [perPage, setPerPage] = useState(1);
  const [swipeStartPos, setSwipeStartPos] = useState(0);
  const [focused, setFocused] = useState(false);
  const [position, setPosition] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  // Builds all slides provided to the slide slot
  function buildSlides() {
    if (!childNodes || childNodes.length <= 0) return;

    const newSlides = childNodes
      .filter((el) => el instanceof Element)
      .map(buildSlide);

    // If direction is right to left, flip the array
    const newSlidesReversed = reverse ? [...newSlides].reverse() : newSlides;

    // If looping is required, add the first page to the end and last page to the beginning
    const newSlidesLooped = loop
      ? [
          ...newSlidesReversed.slice(newSlidesReversed.length - perPage),
          ...newSlidesReversed,
          ...newSlidesReversed.slice(0, perPage),
        ]
      : newSlidesReversed;

    setSlides(newSlidesLooped);
  }

  // Determines which slide should be shown on initialization
  function determineStartSlide() {
    if (!childNodes || childNodes.length <= 0) return;
    const newActiveSlide = loop
      ? (startslide % childNodes.length) + perPage
      : clamp(startslide, 0, childNodes.length);
    goToSlide(newActiveSlide); // might be problem - dont want to do this on window resize
  }

  // Builds an individual slide
  function buildSlide(childElement) {
    const clone = childElement.cloneNode(true);
    clone.setAttribute("class", "slide");
    return renderHtml(clone.outerHTML);
  }

  // Build the track - sliding element that contains all slides
  function buildTrack() {
    if (!carouselRef?.current) return;
    const { offsetWidth } = carouselRef.current;
    setWidth(offsetWidth);
  }

  // Derive number of slides per page based on --perPage CSS variable
  function determineSlidesPerPage() {
    if (!host?.current) return;
    const perPageStyle = getComputedStyle(host.current)?.getPropertyValue(
      "--perPage"
    );
    if (!perPageStyle) return;
    const perPageNum = parseInt(perPageStyle);
    if (typeof perPageNum === "number") setPerPage(perPageNum);
  }

  // Increments / decrements the active slide
  async function adjustActiveSlide(count) {
    const wrapped = await wrapSlide();
    goToSlide(wrapped + count, true);
  }

  // Moves the track to display a given slide
  function goToSlide(index, smooth) {
    const newIndex = clamp(index, 0, lastSlide);
    setActiveSlide(newIndex);

    const newPos = getSlidePos(newIndex);
    goToPos(newPos, smooth);
    onchange({ index: newIndex, position: newPos, smooth });
  }

  // Moves the track to display a given position
  async function goToPos(newPos, smooth) {
    if (smooth) {
      setTransition(true);
      await nextFrame();
      await nextFrame();
      setPos(newPos);
    } else {
      setTransition(false);
      await nextFrame();
      await nextFrame();
      setPos(newPos);
    }
    setSwipeStartPos(newPos);
  }

  // Snaps to the closest slide based on current position
  function goToClosestSlide() {
    const closestIndex = Math.abs(Math.round(position / slideWidth));
    goToSlide(closestIndex, true);
  }

  // Setter for position state to clamp it within track length
  function setPos(newPos) {
    setPosition(clamp(newPos, 0, trackWidth));
  }

  // Returns the desired translation of a target slide
  function getSlidePos(index) {
    return index * slideWidth;
  }

  // Wrap around to the beginning/end if looping is enabled
  function wrapPosition() {
    if (!loop) return;
    const isPastLoop = position >= loopEndPos;
    const isBeforeLoop = position < loopStartPos;
    if (isPastLoop) goToPos(loopStartPos + (position - loopEndPos));
    else if (isBeforeLoop) goToPos(loopEndPos - (loopStartPos - position));
    return isPastLoop || isBeforeLoop;
  }

  // Wrap around to the beginning/end if looping is enabled
  async function wrapSlide() {
    if (!loop) return;
    const atEnd = activeSlide >= loopEnd;
    const atStart = activeSlide <= 0;
    const newSlide = atEnd
      ? loopStart + (activeSlide - loopEnd)
      : atStart
      ? loopEnd - (loopStart - activeSlide)
      : activeSlide;
    const requiresWrap = atStart || atEnd;
    if (requiresWrap) {
      // Need to detect amount of pixels until the loopEnd pos
      const { transform } = window.getComputedStyle(trackRef.current);
      const computedPosition = -1 * getMatrixTranslateValues(transform).x;
      const delta = atEnd
        ? loopEndPos - computedPosition
        : atStart
        ? computedPosition
        : 0;
      console.log({ getSlidePos: getSlidePos(newSlide), delta });
      const newPos = getSlidePos(newSlide) + delta;
      await goToPos(newPos);
      console.log("WRAPPED");
      await nextFrame();
      await nextFrame();
      await nextFrame();
    }
    console.log("GOIN NEXT");
    return newSlide;
  }

  function onSwipeStart() {
    setTransition(false);
    if (wrapPosition()) return;
    setSwipeStartPos(position);
  }

  function onSwiping({ direction, distance }) {
    const sign = direction === "right" ? -1 : 1;
    const swipeDelta = sign * distance;
    setPos(swipeStartPos + swipeDelta);
  }

  function onSwipeEnd({ distance, direction, time }) {
    const distanceMultiplier = 250 * (distance / width); // Bigger swipes should require more time to be considered a drag
    const isDrag = perPage > 2 || time > dragthreshold + distanceMultiplier;

    if (isDrag) {
      goToClosestSlide(); // Snap to closest slide if user is not trying to swipe
    } else {
      const delta = Math.max(
        Math.abs(Math.round(distance / (slideWidth / 2))),
        1
      );
      direction === "left" && adjustActiveSlide(1 * delta);
      direction === "right" && adjustActiveSlide(-1 * delta);
    }
  }

  // Arrow key navigation
  async function onKeyDown(event) {
    if (!focused || event.repeat) return;
    if (event.key === "ArrowRight") {
      adjustActiveSlide(1);
    } else if (event.key === "ArrowLeft") {
      adjustActiveSlide(-1);
    }
  }

  // For usage as a dependency
  const allProps = [
    _width,
    height,
    loop,
    icon,
    flipnav,
    reverse,
    dragthreshold,
    easing,
    duration,
    startslide,
    swipeable,
    perPage,
  ];

  // Effects
  useEffect(determineSlidesPerPage, [host]);
  useEffect(buildSlides, [...allProps, childNodes]);
  useEffect(buildTrack, [...allProps, carouselRef]);
  useEffect(determineStartSlide, [slides]);

  // Event listeners
  useEventListener("resize", onResize, window);
  useEventListener("keydown", onKeyDown, document);
  useOnClickOutside(host, () => setFocused(false));

  // Handlers
  function onResize() {
    determineSlidesPerPage();
    buildTrack();
  }

  const numSlides = slides?.length || 1;
  const lastSlide = numSlides - 1;
  const slideWidth = width / perPage;
  const trackWidth = slideWidth * numSlides;
  const atStart = !loop && activeSlide === 0;
  const atEnd = !loop && activeSlide === lastSlide;
  const loopStart = perPage;
  const loopEnd = numSlides - perPage;
  const loopStartPos = loopStart * slideWidth;
  const loopEndPos = loopEnd * slideWidth;

  return (
    <host
      shadowDom
      tabindex={0}
      onclick={() => setFocused(true)}
      onfocus={() => setFocused(true)}
      onblur={() => setFocused(false)}
    >
      <div
        ref={carouselRef}
        class={cssJoin(["container", swipeable && "swipeable"])}
        style={{ "--width": _width, "--height": height }}
      >
        <div class={cssJoin(["overlay", focused && "focused"])} />
        <div
          ref={trackRef}
          class={cssJoin(["track", transition && "transition"])}
          style={{
            "--numSlides": numSlides,
            "--slideWidth": `${slideWidth}px`,
            "--trackWidth": `${trackWidth}px`,
            "--position": `${-1 * position}px`,
            "--easing": easing,
            "--duration": `${duration / 1000}s`,
          }}
        >
          <slot ref={slotRef} name="slide" />
          {slides}
        </div>
        {Navigators({ adjustActiveSlide, icon, flipnav, atStart, atEnd })}
        <style>{styles}</style>
      </div>
    </host>
  );
}

Carousel.props = {
  width: {
    type: String, // Width of the carousel
    value: "100%",
  },
  height: {
    type: String, // Height of the carousel
    value: "600px",
  },
  loop: {
    type: Boolean, // When reaching the beginning / end, loop around to the other side
    value: true,
  },
  reverse: {
    type: Boolean, // Reverse slide order
    value: false,
  },
  icon: {
    type: String, // Image used for navigator buttons
    value: "https://codecabana.com.au/pkg/@latest/img/arrow.png",
  },
  flipnav: {
    type: Boolean, // Reverse the direction of the navigator button icons
    value: false,
  },
  duration: {
    type: Number, // How long slide transitions take in milliseconds
    value: 300,
  },
  easing: {
    type: String, // https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function
    value: "ease-out",
  },
  dragthreshold: {
    type: Number, // Time in millis that a swipe (preserves momentum) becomes a drag (no momentum)
    value: 500,
  },
  startslide: {
    type: Number, // Slide to begin on
    value: 0,
  },
  swipeable: {
    type: Boolean, // Carousel can be swiped/dragged
    value: true,
  },
  onchange: {
    type: Function, // Do something when the active slide is changed
    value: () => {},
  },
};

// CSS props (so that they can be controlled via media query)
// --perPage - how many slides to show per page of the carousel

customElements.define("codecabana-carousel", c(Carousel));
