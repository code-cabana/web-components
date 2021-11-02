import { c, useEffect, useHost, useRef, useState } from "atomico";
import { useEventListener, useSwipe } from "../../lib/hooks";
import { useSlot } from "@atomico/hooks/use-slot";
import { nextFrame } from "../../lib/animation";
import { renderHtml } from "../../lib/dom";
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
  oninit = () => {},
  onchange = () => {},
} = {}) {
  const host = useHost();
  const carouselRef = useRef();
  const slotRef = useRef();
  const childNodes = useSlot(slotRef);
  const trackRef = useSwipe({ onSwipeStart, onSwiping, onSwipeEnd });
  const [width, setWidth] = useState(0);
  const [slides, setSlides] = useState();
  const [activeSlide, setActiveSlide] = useState(0);
  const [transition, setTransition] = useState(true);
  const [perPage, setPerPage] = useState(1);
  const [position, setPosition] = useState(0);
  const [swipeStartPos, setSwipeStartPos] = useState(0);

  // Builds all slides provided to the slide slot
  function buildSlides() {
    if (!childNodes) return;

    const newSlides = childNodes
      .filter((el) => el instanceof Element)
      .map(buildSlide);

    // If direction is right to left, flip the array
    const newSlidesReversed = reverse ? [...newSlides].reverse() : newSlides;

    // If looping is required, add the first page to the end and last page to the beginning
    const newSlidesLooped = loop
      ? [
          ...newSlidesReversed.slice(newSlidesReversed - perPage),
          ...newSlidesReversed,
          ...newSlidesReversed.slice(0, perPage),
        ]
      : newSlidesReversed;

    setSlides(newSlidesLooped);
  }

  // Determines which slide should be shown on initialization
  function determineStartSlide() {
    if (!slides) return;
    const newActiveSlide = loop
      ? startslide % slides.length
      : clamp(startslide, 0, slides.length);
    setActiveSlide(newActiveSlide); // might be problem - dont want to do this on window resize
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
  function adjustActiveSlide(count) {
    goToSlide(activeSlide + count, true);
  }

  // Moves the track to display a given slide
  async function goToSlide(index, smooth) {
    const newIndex = clamp(index, 0, lastSlide);
    setActiveSlide(newIndex);

    const newPos = getSlidePos(newIndex);
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
  function snapToClosestSlide() {
    const closestIndex = Math.abs(Math.round(position / slideWidth));
    goToSlide(closestIndex, true);
  }

  // Setter for position state to clamp it within track length
  function setPos(newPos) {
    const maxPos = -1 * slideWidth * (numSlides - perPage);
    setPosition(clamp(newPos, maxPos, 0));
  }

  // Returns the desired translation of a target slide
  function getSlidePos(index) {
    return -1 * slideWidth * index;
  }

  function onSwipeStart() {
    setTransition(false);
    setSwipeStartPos(position);
  }

  function onSwiping({ direction, distance }) {
    const sign = direction === "right" ? 1 : -1;
    const swipeDelta = sign * distance;
    setPos(swipeStartPos + swipeDelta);
  }

  function onSwipeEnd({ distance, direction, time }) {
    const distanceMultiplier = 250 * (distance / width); // Bigger swipes should require more time to be considered a drag
    const isDrag = perPage > 2 || time > dragthreshold + distanceMultiplier;
    if (isDrag) {
      snapToClosestSlide(); // Snap to closest slide if user is not trying to swipe
    } else {
      const delta = Math.max(
        Math.abs(Math.round(distance / (slideWidth / 2))),
        1
      );
      direction === "left" && adjustActiveSlide(1 * delta);
      direction === "right" && adjustActiveSlide(-1 * delta);
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

  // Handlers
  function onResize() {
    determineSlidesPerPage();
    buildTrack();
  }

  const numSlides = slides?.length || 1;
  const lastSlide = numSlides - perPage;
  const atStart = !loop && activeSlide === 0;
  const atEnd = !loop && activeSlide === lastSlide;

  const slideWidth = width / perPage;
  const trackWidth = slideWidth * numSlides;

  return (
    <host shadowDom tabindex={0}>
      <div
        ref={carouselRef}
        class={cssJoin(["container", swipeable && "swipeable"])}
        style={{ "--width": _width, "--height": height }}
      >
        <div
          ref={trackRef}
          class={cssJoin(["track", transition && "transition"])}
          style={{
            "--numSlides": numSlides,
            "--slideWidth": `${slideWidth}px`,
            "--trackWidth": `${trackWidth}px`,
            "--position": `${position}px`,
            "--easing": easing,
            "--duration": duration,
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
    type: String,
    value: "100%",
  },
  height: {
    type: String,
    value: "600px",
  },
  loop: {
    type: Boolean,
    value: false,
  },
  reverse: {
    type: Boolean, // Reverse slide order
    value: false,
  },
  icon: {
    type: String,
    value: "https://codecabana.com.au/pkg/@latest/img/arrow.png",
  },
  flipnav: {
    type: Boolean,
    value: false,
  },
  duration: {
    type: Number,
    value: 200,
  },
  easing: {
    type: String,
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
};

// CSS props (so that they can be controlled via media query)
// --perPage

customElements.define("codecabana-carousel", c(Carousel));
