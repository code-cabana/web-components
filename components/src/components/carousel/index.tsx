import { cssJoin } from "../../lib/util";

export type Carousel = {
  width?: string;
  height?: string;
  itemsPerViewport?: string;
  startItem?: string;
  loop?: string;
  autoplay?: string;
  autoplayInterval?: string;
  autoplayDirection?: string;
  autoplayPauseOnFocus?: string;
  swipeable?: string;
  useMomentum?: string;
  momentumMultiplier?: string;
  snap?: string;
  reverse?: string;
  dragThreshold?: string;
  minSwipeDistance?: string;
  icon?: string;
  flipNav?: string;
  enlargeNav?: string;
  duration?: string;
  easing?: string;
  onChange?: string;
};

export function Carousel({ swipeable }: Carousel) {
  return (
    <div
      part="viewport"
      className={cssJoin("viewport", swipeable && "swipeable")}
    >
      <div part="track" className="track">
        <slot name="item" />
      </div>
    </div>
  );
}
