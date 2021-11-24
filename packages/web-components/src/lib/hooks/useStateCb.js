import { useEffect, useRef, useState } from "atomico/core";

// https://github.com/the-road-to-learn-react/use-state-with-callback/blob/master/src/index.js
export default function useStateWithCallbackLazy(initialValue) {
  const callbackRef = useRef(null);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(value);
      callbackRef.current = null;
    }
  }, [value]);

  const setValueWithCallback = (newValue, callback) => {
    callbackRef.current = callback;
    return setValue(newValue);
  };

  return [value, setValueWithCallback];
}
