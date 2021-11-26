import { useCallback, useRef, useState } from "atomico/core";
import useEventListener from "./useEventListener";

// Detects touch and mouse swipe movement and executes a callback function
// onSwipeStart ({ swipeStartPos, swipeStartTime })
// onSwiping ({ direction, distance })
// onSwipeEnd ({ direction, distance })
export default function useSwipe({
  maxTime = -1,
  corners = false,
  onSwipeStart,
  onSwiping,
  onSwipeEnd,
} = {}) {
  const node = useRef();
  const [held, setHeld] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [swipeStartPos, setSwipeStartPos] = useState();
  const [swipeStartTime, setSwipeStartTime] = useState();
  const [swipeOrigin, setSwipeOrigin] = useState(); // Ignores resetSwipe that applies to swipeStartPos - useful for measuring total delta
  const [swipeOriginTime, setSwipeOriginTime] = useState(); // Ignores resetSwipe that applies to swipeStartTime - useful for measuring total swipe time

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

    return { direction, directions, distance };
  }

  function resetSwipe(event) {
    setSwipeStartPos(getPosition(event));
    setSwipeStartTime(Date.now());
  }

  const onDown = useCallback(
    (event) => {
      event.preventDefault();
      setHeld(true);
      const pos = getPosition(event);
      const now = Date.now();
      setSwipeOrigin(pos);
      setSwipeStartPos(pos);
      setSwipeStartTime(now);
      setSwipeOriginTime(now);
    },
    [setHeld, setSwipeStartPos, setSwipeStartTime]
  );

  const onMove = useCallback(
    (event) => {
      event.preventDefault();
      if (!held) return;

      if (typeof onSwiping === "function") {
        const currentPos = getPosition(event);
        const { direction, directions, distance } = getDirAndDist(
          swipeStartPos,
          currentPos
        );
        const {
          direction: totalDirection,
          directions: totalDirections,
          distance: totalDistance,
        } = getDirAndDist(swipeOrigin, currentPos);

        if (!swiping) {
          if (typeof onSwipeStart === "function")
            onSwipeStart({ swipeStartPos, swipeStartTime });
          setSwiping(true);
        }
        const shouldReset = onSwiping({
          direction,
          directions,
          distance,
          totalDirection,
          totalDirections,
          totalDistance,
        });
        if (shouldReset) resetSwipe(event);
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

      const now = Date.now();
      const time = now - swipeStartTime;
      const totalTime = now - swipeOriginTime;
      if (maxTime === -1 || totalTime <= maxTime) {
        const swipeEndPos = getPosition(event);
        const { direction, directions, distance } = getDirAndDist(
          swipeStartPos,
          swipeEndPos
        );
        const {
          direction: totalDirection,
          directions: totalDirections,
          distance: totalDistance,
        } = getDirAndDist(swipeOrigin, swipeEndPos);

        if (typeof onSwipeEnd === "function")
          onSwipeEnd({
            direction,
            directions,
            distance,
            totalDirection,
            totalDirections,
            totalDistance,
            time,
            totalTime,
          });
      }
    },
    [setHeld, setSwiping, onSwipeEnd]
  );

  // Touch
  useEventListener("touchmove", onMove, node.current);
  useEventListener("touchstart", onDown, node.current);
  useEventListener("touchend", onUp, node.current);

  // Mouse
  useEventListener("mousemove", onMove, node.current);
  useEventListener("mousedown", onDown, node.current);
  useEventListener("mouseup", onUp, node.current);
  useEventListener("mouseleave", onUp, node.current);

  return node;
}
