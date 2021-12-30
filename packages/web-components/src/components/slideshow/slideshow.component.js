import { c, useEffect, useRef, useState } from "atomico";
import { useSlot } from "@atomico/hooks/use-slot";
import styles from "./slideshow.scss";

function Slideshow({
  width,
  height,
  duration: _duration,
  objectFit,
  objectPosition,
}) {
  const [activeItem, setActiveItem] = useState(0);
  const slotRef = useRef();
  const rawItems = useSlot(slotRef);
  const items = rawItems.filter((el) => el instanceof HTMLElement);
  const duration = Math.max(100, _duration);

  // Enhance items
  useEffect(() => {
    items.forEach((el, index) => {
      const visible = index === activeItem;
      if (visible) el.setAttribute("visible", "");
      else el.removeAttribute("visible");
      el.setAttribute("aria-hidden", (!visible).toString());
      el.setAttribute("part", "item");
      el.setAttribute("alt", "");
      el.classList.add("item");
    });
  }, [activeItem, items]);

  // Rotate the active item
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveItem((prevActive) => (prevActive + 1) % items.length);
    }, duration);
    return () => clearInterval(interval);
  }, [items]);

  return (
    <host shadowDom>
      <div
        class="viewport"
        part="viewport"
        style={{
          "--width": width,
          "--height": height,
          "--duration": duration,
          "--object-fit": objectFit,
          "--object-position": objectPosition,
        }}
      >
        <slot ref={slotRef} />
        <style>{styles}</style>
      </div>
    </host>
  );
}

Slideshow.props = {
  width: {
    // description: The width of the slideshow in any valid CSS unit value
    type: String,
    value: "500px",
  },
  height: {
    // description: The height of the slideshow in any valid CSS unit value
    type: String,
    value: "500px",
  },
  duration: {
    // description: Duration each image is visible for in milliseconds
    type: Number,
    value: 2000,
  },
  objectFit: {
    // description: https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
    type: String,
    value: "cover",
  },
  objectPosition: {
    // description: https://developer.mozilla.org/en-US/docs/Web/CSS/object-position
    type: String,
    value: "center",
  },
};

customElements.define("codecabana-slideshow", c(Slideshow));
