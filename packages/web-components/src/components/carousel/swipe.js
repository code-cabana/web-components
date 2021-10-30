import { useEffect, useRef, useState } from "atomico/core";

// Detects touch and mouse swipe movement and executes a callback function
// onSwiping ({ direction, distance })
// onSwipeEnd ({ direction, distance })
export default function useSwipe({
  minDistance = 100,
  maxTime = 500,
  corners = false,
  onSwiping,
  onSwipeEnd,
} = {}) {
  const node = useRef();
  const [held, setHeld] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [swipeStartPos, setSwipeStartPos] = useState();
  const [swipeStartTime, setSwipeStartTime] = useState();
  // let { current: held } = useRef(_held) || {};

  // function setHeld(newState) {
  //   held = newState;
  //   _setHeld(newState);
  // }

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

  function onDown(event) {
    event.preventDefault();
    console.log("DOWN");
    setHeld(true);
    setSwipeStartPos(getPosition(event));
    setSwipeStartTime(Date.now());
  }

  function onMove(event) {
    event.preventDefault();
    console.log("MOVE", held);
    if (!held) return;
    setSwiping(true);

    if (typeof onSwiping === "function") {
      const currentPos = getPosition(event);
      const { direction, distance } = getDirAndDist(swipeStartPos, currentPos);
      if (distance >= minDistance) {
        onSwiping({ direction, distance });
      }
    }
  }

  function onUp(event) {
    event.preventDefault();
    console.log("UP");
    setHeld(false);
    if (!swiping) return;
    setSwiping(false);

    const elapsedTime = Date.now() - swipeStartTime;
    if (elapsedTime <= maxTime) {
      const swipeEndPos = getPosition(event);
      const { direction, distance } = getDirAndDist(swipeStartPos, swipeEndPos);
      if (distance >= minDistance) {
        if (typeof onSwipeEnd === "function")
          onSwipeEnd({ direction, distance });
      }
    }
  }

  useEffect(() => {
    if (!node || !node.current) return;
    console.log("INIT");
    // node.current.addEventListener("touchstart", (event) => onDown(event));
    // node.current.addEventListener("touchend", (event) => onUp(event));
    // node.current.addEventListener("touchmove", (event) => onMove(event));
    // node.current.addEventListener("mousedown", (event) => onDown(event));
    // document.addEventListener("mouseup", (event) => onUp(event));
    // document.addEventListener("mousemove", (event) => onMove(event));
    console.log(node.current);
    node.current.ontouchstart = onDown;
    node.current.ontouchend = onUp;
    node.current.ontouchmove = onMove;
    node.current.onmousedown = onDown;
    document.onmouseup = onUp;
    document.onmousemove = onMove;
    return () => {
      // node.current.removeEventListener("touchstart", (event) => onDown(event));
      // node.current.removeEventListener("touchend", (event) => onUp(event));
      // node.current.removeEventListener("touchmove", (event) => onMove(event));
      // node.current.removeEventListener("mousedown", (event) => onDown(event));
      // document.removeEventListener("mouseup", (event) => onUp(event));
      // document.removeEventListener("mousemove", (event) => onMove(event));
      node.current.ontouchstart = undefined;
      node.current.ontouchend = undefined;
      node.current.ontouchmove = undefined;
      node.current.onmousedown = undefined;
      document.onmouseup = undefined;
      document.onmousemove = undefined;
    };
  }, [node]);

  return node;
}

// UP TO: event handlers only have access to initial state - need to find way to preserve state across calls
// maybe just re-register?

// helpful : https://stackoverflow.com/questions/53845595/wrong-react-hooks-behaviour-with-event-listener
