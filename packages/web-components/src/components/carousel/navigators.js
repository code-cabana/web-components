import { cssJoin } from "../../lib/array";

export default function Navigators({
  icon,
  flipnav,
  adjustActiveSlide,
  atStart,
  atEnd,
}) {
  return (
    <div className="navigators" part="navigators">
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
        part="previous navigator"
      >
        <img alt="previous" src={icon} />
      </button>
      <button
        tabindex={-1}
        onclick={() => {
          adjustActiveSlide(1);
        }}
        className={cssJoin(["next", !flipnav && "flip", atEnd && "disabled"])}
        part="next navigator"
      >
        <img alt="next" src={icon} />
      </button>
    </div>
  );
}
