import { c, useEffect, useProp, useRef, useState } from "atomico";
import { useSlot } from "@atomico/hooks/use-slot";
import { renderHtml } from "../../lib/dom";
import { cssJoin } from "../../lib/array";
import { nextFrame } from "../../lib/animation";
import Navigators from "./navigators";
import useSwipe from "./swipe";
import styles from "./carousel.scss";

function Carousel() {
  const slotRef = useRef();
  const trackRef = useRef();
  const swipeRef = useSwipe({
    onSwiping: ({ direction, distance }) => {
      console.log(direction, distance);
    },
  });
  const childNodes = useSlot(slotRef);
  const [loop] = useProp("loop");
  const [icon] = useProp("icon");
  const [autoplay] = useProp("autoplay");
  const [duration] = useProp("duration");
  const [direction] = useProp("direction");
  const [interval] = useProp("interval");
  const [pauseonfocus] = useProp("pauseonfocus");
  const [flipnav] = useProp("flipnav");
  const [focused, setFocused] = useState(false);
  const [activeSlide, setActiveSlide] = useState(loop ? 1 : 0);

  const loopedChildren = loop
    ? [
        ...childNodes.slice(childNodes.length - 1),
        ...childNodes,
        ...childNodes.slice(0, 1),
      ] // If looping is required, add the first slide to the end and last slide to the beginning
    : childNodes;

  const slides = loopedChildren
    .filter((el) => el instanceof Element)
    .map((child) => renderHtml(child.cloneNode(true).outerHTML));

  const numSlides = slides.length;
  const lastSlide = numSlides - 1;
  const loopStart = 1;
  const loopEnd = lastSlide - 1;
  const atStart = !loop && activeSlide === 0;
  const atEnd = !loop && activeSlide === lastSlide;

  function goToSlide(index) {
    const newIndex = Math.min(lastSlide, Math.max(0, index));
    setActiveSlide(newIndex);
  }

  function adjustActiveSlide(count) {
    goToSlide(activeSlide + count);
  }

  function onTransitionEnd() {
    if (!loop) return;
    if (activeSlide > loopEnd) {
      setActiveSlide(loopStart);
      reset();
    } else if (activeSlide < loopStart) {
      setActiveSlide(loopEnd);
      reset();
    }
  }

  // Arrow key navigation
  function onKeyDown(event) {
    if (!focused) return;
    if (event.key === "ArrowRight") {
      adjustActiveSlide(1);
    } else if (event.key === "ArrowLeft") {
      adjustActiveSlide(-1);
    }
  }

  async function reset() {
    const transitionStyle = trackRef.current.style.transition;
    trackRef.current.style.transition = "none";
    await nextFrame();
    await nextFrame();
    trackRef.current.style.transition = transitionStyle;
  }

  // Initialize autoplay
  useEffect(() => {
    if (!autoplay || numSlides <= 0) return;
    const autoplayTimeoutRef = setTimeout(() => {
      if (pauseonfocus && focused) return;
      if (direction === "left") adjustActiveSlide(-1);
      else adjustActiveSlide(1);
    }, interval);

    return () => clearTimeout(autoplayTimeoutRef);
  }, [activeSlide, numSlides, focused]);

  return (
    <host
      shadowDom
      tabindex={0}
      style={{
        "--numSlides": numSlides,
        "--duration": `${duration}s`,
      }}
      onfocus={() => setFocused(true)}
      onblur={() => setFocused(false)}
      onkeydown={onKeyDown}
    >
      <div ref={swipeRef}>hi</div>
      {/* <div class="container" part="container">
        <div
          class={cssJoin(["overlay", focused && "focused"])}
          part="overlay"
        />
        <div
          class="track transition"
          part="slides"
          ref={trackRef}
          ontransitionend={onTransitionEnd}
          style={{ "--activeSlide": activeSlide }}
        >
          <slot name="slide" ref={slotRef} style="display: none;"></slot>
          {slides}
        </div>
        {Navigators({ adjustActiveSlide, icon, flipnav, atStart, atEnd })}
      </div> */}
      <style>{styles}</style>
    </host>
  );
}

Carousel.props = {
  loop: {
    type: Boolean,
    reflect: false,
    value: true,
  },
  autoplay: {
    type: Boolean,
    reflect: false,
    value: false,
  },
  interval: {
    type: Number,
    reflect: false,
    value: 3000,
  },
  direction: {
    type: String,
    reflect: false,
    value: "right",
  },
  duration: {
    type: Number,
    reflect: false,
    value: 0.3,
  },
  pauseonfocus: {
    type: Boolean,
    reflect: false,
    value: true,
  },
  draggable: {
    type: Boolean,
    reflect: false,
    value: true,
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
