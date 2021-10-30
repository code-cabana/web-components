import { cssJoin } from "../../lib/array";

export default function Navigators({
  icon,
  flipnav,
  adjustActiveSlide,
  atStart,
  atEnd,
}) {
  return (
    <div className="navigators">
      <button
        tabindex={-1}
        onclick={() => {
          adjustActiveSlide(-1);
        }}
        className={cssJoin([
          "previous",
          flipnav && "flip",
          atStart && "disabled",
        ])}
      >
        <img alt="previous" src={icon} />
      </button>
      <button
        tabindex={-1}
        onclick={() => {
          adjustActiveSlide(1);
        }}
        className={cssJoin(["next", !flipnav && "flip", atEnd && "disabled"])}
      >
        <img alt="next" src={icon} />
      </button>
    </div>
  );
}
