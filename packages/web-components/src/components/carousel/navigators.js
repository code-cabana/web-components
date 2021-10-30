import { cssJoin } from "../../lib/array";

export default function Navigators({
  icon,
  flip,
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
        className={cssJoin(["previous", flip && "flip", atStart && "disabled"])}
      >
        <img alt="previous" src={icon} />
      </button>
      <button
        tabindex={-1}
        onclick={() => {
          adjustActiveSlide(1);
        }}
        className={cssJoin(["next", !flip && "flip", atEnd && "disabled"])}
      >
        <img alt="next" src={icon} />
      </button>
    </div>
  );
}
