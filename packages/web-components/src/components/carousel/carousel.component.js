import { c, useEffect, useHost, useRef, useState } from "atomico";
import { useEventListener, useSwipe } from "../../lib/hooks";
import { useSlot } from "@atomico/hooks/use-slot";
import { nextFrame } from "../../lib/animation";
import { renderHtml } from "../../lib/dom";
import { cssJoin } from "../../lib/array";
import { debug } from "../../lib/logger";
import { clamp } from "../../lib/math";
import Navigators from "./navigators";
import styles from "./carousel.scss";

// Based on Siema
// https://github.com/pawelgrzybek/siema

function Carousel({
  loop = false,
  icon,
  flipnav,
  direction = "right",
  duration = 200,
  easing = "ease-out",
  startslide = 0,
  swipeable = true,
  debug: dbug = false,
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

  function debugLog(message) {
    dbug && debug("[Carousel]", message);
  }

  // Builds all slides provided to the slide slot
  function buildSlides() {
    if (!childNodes) return;

    const newSlides = childNodes
      .filter((el) => el instanceof Element)
      .map(buildSlide);

    // If direction is right to left, flip the array
    const newSlidesDirected =
      direction === "left" ? [...newSlides].reverse() : newSlides;

    // If looping is required, add the first page to the end and last page to the beginning
    const newSlidesLooped = loop
      ? [
          ...newSlidesDirected.slice(newSlidesDirected - perPage),
          ...newSlidesDirected,
          ...newSlidesDirected.slice(0, perPage),
        ]
      : newSlidesDirected;

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

  function onSwipeEnd() {
    snapToClosestSlide();
  }

  // Effects
  useEffect(determineSlidesPerPage, [host]);
  useEffect(buildSlides, [childNodes, direction, loop, perPage]);
  useEffect(buildTrack, [carouselRef]);
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
      >
        <div
          ref={trackRef}
          class={cssJoin(["track", transition && "transition"])}
          style={{
            "--numSlides": numSlides,
            "--slideWidth": `${slideWidth}px`,
            "--trackWidth": `${trackWidth}px`,
            "--position": `${position}px`,
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
  loop: {
    type: Boolean,
    reflect: false,
    value: false,
  },
  debug: {
    type: Boolean,
    reflect: false,
    value: false,
  },
  direction: {
    type: String,
    reflect: false,
    value: "right",
  },
  icon: {
    type: String,
    reflect: false,
    value: "https://codecabana.com.au/pkg/@latest/img/arrow.png",
  },
  flipnav: {
    type: Boolean,
    reflect: false,
    value: false,
  },
};

customElements.define("codecabana-carousel", c(Carousel));
