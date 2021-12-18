import { cssJoin } from "../../lib/array";

export default function Navigators({
  icon,
  flipNav,
  enlargeNav,
  adjustActiveItem,
  atStart,
  atEnd,
}) {
  return (
    <div className="navigators" part="navigators">
      <button
        tabindex={-1}
        onclick={() => adjustActiveItem(-1)}
        className={cssJoin([
          "previous",
          flipNav && "flip",
          enlargeNav && "enlarge",
          atStart && "disabled",
        ])}
        part="previous navigator"
      >
        <img alt="previous" src={icon} />
      </button>
      <button
        tabindex={-1}
        onclick={() => adjustActiveItem(1)}
        className={cssJoin([
          "next",
          !flipNav && "flip",
          enlargeNav && "enlarge",
          atEnd && "disabled",
        ])}
        part="next navigator"
      >
        <img alt="next" src={icon} />
      </button>
    </div>
  );
}
