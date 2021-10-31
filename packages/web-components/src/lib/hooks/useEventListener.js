// https://usehooks.com/useEventListener/
import { useRef, useEffect } from "atomico";

export default function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef(); // Create a ref that stores handler

  useEffect(() => {
    savedHandler.current = handler; // Update ref.current value if handler changes to prevent re-renders
  }, [handler]);

  useEffect(
    () => {
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;

      const eventListener = (event) => savedHandler.current(event); // Create event listener that calls handler function stored in ref
      element.addEventListener(eventName, eventListener); // Add event listener

      return () => {
        element.removeEventListener(eventName, eventListener); // Remove event listener on cleanup
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
}

/* Usage

   const handler = useCallback(
     ({ clientX, clientY }) => {
       setCoords({ x: clientX, y: clientY });
     },
     [setCoords]
   );
   
   useEventListener("mousemove", handler, document);

*/
