import { c, useEffect, useHost, useRef, useState } from "atomico";
import { useSlot } from "@atomico/hooks/use-slot";
import { renderHtml } from "../../lib/dom";
import { debug } from "../../lib/logger";
import { clamp } from "../../lib/math";
import { cssJoin } from "../../lib/array";
import { useEventListener } from "../../lib/hooks";
import { nextFrame } from "../../lib/animation";
import styles from "./carousel.scss";

// Based on Siema
// https://github.com/pawelgrzybek/siema

function Carousel({
  loop = false,
  direction = "right",
  duration = 200,
  easing = "ease-out",
  startslide = 0,
  swipeable = true,
  threshold = 20,
  debug: dbug = false,
  onInit = () => {},
  onChange = () => {},
} = {}) {
  const host = useHost();
  const carouselRef = useRef();
  const slotRef = useRef();
  const childNodes = useSlot(slotRef);
  const [width, setWidth] = useState(0);
  const [slides, setSlides] = useState();
  const [activeSlide, setActiveSlide] = useState(0);
  const [transition, setTransition] = useState(true);
  const [perPage, setPerPage] = useState(1);
  const [position, setPosition] = useState(0);

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

  // Returns the desired translation for the current active slide
  function getCurrentPos() {
    return (direction === "left" ? 1 : -1) * activeSlide * slideWidth;
  }

  // Moves the track to a given position
  async function scrollToPos(newPos, smooth) {
    if (smooth) {
      setTransition(true);
      await nextFrame();
      await nextFrame();
      setPosition(newPos);
    } else {
      setTransition(false);
      await nextFrame();
      await nextFrame();
      setPosition(newPos);
    }
  }

  // Effects
  useEffect(determineSlidesPerPage, [host]);
  useEffect(buildSlides, [childNodes, direction, loop, perPage]);
  useEffect(buildTrack, [carouselRef]);
  useEffect(determineStartSlide, [slides]);

  // Event listeners
  useEventListener("resize", onResize, window);

  // useEventListener("touchstart", onTouchStart, carouselRef.current);
  // useEventListener("touchend", onTouchEnd, carouselRef.current);
  // useEventListener("touchmove", onTouchMove, carouselRef.current);

  // useEventListener("mousedown", onMouseDown, carouselRef.current);
  // useEventListener("mouseup", onMouseUp, carouselRef.current);
  // useEventListener("mouseleave", onMouseLeave, carouselRef.current);
  // useEventListener("mousemove", onMouseMove, carouselRef.current);

  // useEventListener("click", onClick, carouselRef.current);

  // Handlers
  function onResize() {
    determineSlidesPerPage();
    buildTrack();
  }

  const numSlides = slides?.length || 1;
  const slideWidth = width / perPage;
  const trackWidth = slideWidth * numSlides;

  return (
    <host shadowDom tabindex={0}>
      <div
        ref={carouselRef}
        class={cssJoin(["container", swipeable && "swipeable"])}
      >
        <div
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
};

customElements.define("codecabana-carousel", c(Carousel));
