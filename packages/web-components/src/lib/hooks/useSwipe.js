import { useCallback, useRef, useState } from "atomico/core";
import { useEventListener } from "./index";

// Detects touch and mouse swipe movement and executes a callback function
// onSwiping ({ direction, distance })
// onSwipeEnd ({ direction, distance })
export default function useSwipe({
  minDistance = 100,
  maxTime = -1,
  corners = false,
  onSwiping,
  onSwipeEnd,
} = {}) {
  const node = useRef();
  const [held, setHeld] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [swipeStartPos, setSwipeStartPos] = useState();
  const [swipeStartTime, setSwipeStartTime] = useState();

  // Returns X/Y coordinates of an event
  function getPosition(event) {
    const { pageX: x, pageY: y } = event || {};
    return { x, y };
  }

  // Returns distance between two positions
  function getDelta(startPos, endPos) {
    return {
      x: endPos.x - startPos.x,
      y: endPos.y - startPos.y,
    };
  }

  // Converts a delta value to compass directions
  function getDirections(delta, corners) {
    const cardinal = {
      left: delta.x <= 0 ? Math.abs(delta.x) : 0,
      right: delta.x >= 0 ? Math.abs(delta.x) : 0,
      up: delta.y <= 0 ? Math.abs(delta.y) : 0,
      down: delta.y >= 0 ? Math.abs(delta.y) : 0,
    };
    const ordinal = {
      leftup: Math.abs(cardinal.left + cardinal.up) / 1.5,
      leftdown: Math.abs(cardinal.left + cardinal.down) / 1.5,
      rightup: Math.abs(cardinal.right + cardinal.up) / 1.5,
      rightdown: Math.abs(cardinal.right + cardinal.down) / 1.5,
    };
    return corners ? { ...cardinal, ...ordinal } : cardinal;
  }

  // Sorts directional influences from largest to smallest
  function sort(directions) {
    return Object.keys(directions).sort(
      (a, b) => directions[b] - directions[a]
    );
  }

  // Returns direction and distance between two points
  function getDirAndDist(startPos, endPos) {
    const delta = getDelta(startPos, endPos);
    const directions = getDirections(delta, corners);
    const direction = sort(directions)[0];
    const distance = directions[direction];

    return { direction, distance };
  }

  const onDown = useCallback(
    (event) => {
      event.preventDefault();
      setHeld(true);
      setSwipeStartPos(getPosition(event));
      setSwipeStartTime(Date.now());
    },
    [setHeld, setSwipeStartPos, setSwipeStartTime]
  );

  const onMove = useCallback(
    (event) => {
      event.preventDefault();
      if (!held) return;
      setSwiping(true);

      if (typeof onSwiping === "function") {
        const currentPos = getPosition(event);
        const { direction, distance } = getDirAndDist(
          swipeStartPos,
          currentPos
        );
        if (distance >= minDistance) {
          onSwiping({ direction, distance });
        }
      }
    },
    [setSwiping, onSwiping]
  );

  const onUp = useCallback(
    (event) => {
      event.preventDefault();
      setHeld(false);
      if (!swiping) return;
      setSwiping(false);

      const elapsedTime = Date.now() - swipeStartTime;
      if (maxTime === -1 || elapsedTime <= maxTime) {
        const swipeEndPos = getPosition(event);
        const { direction, distance } = getDirAndDist(
          swipeStartPos,
          swipeEndPos
        );
        if (distance >= minDistance) {
          if (typeof onSwipeEnd === "function")
            onSwipeEnd({ direction, distance });
        }
      }
    },
    [setHeld, setSwiping, onSwipeEnd]
  );

  useEventListener("touchstart", onDown, node.current);
  useEventListener("touchend", onUp, node.current);
  useEventListener("touchmove", onMove, node.current);
  useEventListener("mousedown", onDown, node.current);
  useEventListener("mouseup", onUp, document);
  useEventListener("mousemove", onMove, document);

  return node;
}
