import { c, render, useEffect, useRef, useState } from "atomico";
import { useSlot } from "@atomico/hooks/use-slot";
import { cssJoin } from "../../lib/array";
import styles from "./typewriter.scss";

function Typewriter({
  duration: _duration,
  backspaceDuration: _backspaceDuration,
  constantSpeed,
  pause: _pause,
  backspacePause: _backspacePause,
  cursor,
  cursorStyle: _cursorStyle,
  cursorBlinkSpeed,
  cursorBlinkFade,
  cursorColor,
}) {
  const slotRef = useRef();
  const rawItems = useSlot(slotRef);
  const items = rawItems.filter((el) => el instanceof HTMLElement);
  const [messages, setMessages] = useState([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [ticks, setTicks] = useState(0);
  const maxTicks = 10;

  const {
    text: messageText,
    duration: messageDuration,
    backspaceDuration: messageBackspaceDuration,
    pause: messagePause,
    backspacePause: messageBackspacePause,
  } = messages[messageIndex] || {};
  const backspaceDuration =
    _backspaceDuration > 0 ? _backspaceDuration : _duration;

  const duration =
    direction === 1
      ? parseInt(messageDuration) || _duration
      : parseInt(messageBackspaceDuration) || backspaceDuration;
  const pause =
    direction === 1
      ? parseInt(messagePause) || _pause
      : parseInt(messageBackspacePause) || _backspacePause;
  const substring = messageText && messageText.substring(0, cursorPos);
  const renderedMessage = substring && substring.length > 0 && substring;
  const characterDuration = constantSpeed
    ? duration
    : messageText && duration / messageText.length;

  const cursorStyle = cursor ? undefined : _cursorStyle;

  function rebuild() {
    const messages = items.map((el) => ({
      text: el.innerText,
      pause: el.dataset.pause,
      duration: el.dataset.duration,
      backspaceDuration: el.dataset.backspaceDuration,
      backspacePause: el.dataset.backspacePause,
    }));
    setMessages(messages);
    return () => setMessages([]);
  }

  function initAnimation() {
    const animIntervalRef = setInterval(() => {
      setTicks((prevTicks) => {
        const newTicks = prevTicks + 1;
        return newTicks > maxTicks ? 0 : newTicks;
      });
    }, characterDuration);
    return () => clearInterval(animIntervalRef);
  }

  function onRevealed() {
    if (pause <= 0) {
      setDirection(-1);
    } else {
      setPaused(true);
      setTimeout(() => {
        setDirection(-1);
        setPaused(false);
      }, pause);
    }
  }

  function onBackspaced() {
    if (pause <= 0) {
      setDirection(-1);
    } else {
      setPaused(true);
      setTimeout(() => {
        setDirection(1);
        setPaused(false);
      }, pause);
    }

    setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
  }

  function onTick() {
    if (!messageText || paused) return;
    if (cursorPos >= messageText.length && direction === 1) return onRevealed();
    else if (cursorPos <= 0 && direction === -1) return onBackspaced();
    setCursorPos((prevPlayhead) => prevPlayhead + direction);
  }

  useEffect(rebuild, [rawItems]);
  useEffect(initAnimation, [rawItems, characterDuration]);
  useEffect(onTick, [ticks, characterDuration]);

  return (
    <host
      shadowDom
      style={{
        "--cursor-blink-speed": `${cursorBlinkSpeed}ms`,
        "--cursor-blink-anim": cursorBlinkFade ? "soft" : "hard",
        "--cursor-color": cursorColor,
      }}
    >
      <slot ref={slotRef} />
      <p class="message" part="message">
        {renderedMessage || (!cursor && <span>&#8203;</span>)}
        <div class={cssJoin(["cursor", cursorStyle])} part="cursor">
          {cursor}
        </div>
      </p>
      <style>{styles}</style>
    </host>
  );
}

Typewriter.props = {
  duration: {
    // description: Time taken to reveal each message in milliseconds
    type: Number,
    value: 500,
  },
  backspaceDuration: {
    // description: Time taken to backspace a message in milliseconds, defaults to -1 (use same value as duration)
    type: Number,
    value: -1,
  },
  constantSpeed: {
    // description: Use a constant typing speed for all messages. If true, duration will mean time taken to reveal each character, regardless of message length
    type: Boolean,
    value: false,
  },
  pause: {
    // description: After a message is revealed, how long to wait in milliseconds before backspacing
    type: Number,
    value: 1000,
  },
  backspacePause: {
    // description: After a message is backspaced, how long to wait in milliseconds before revealing the next message
    type: Number,
    value: 50,
  },
  cursor: {
    // description: Unicode character to use as the blinking cursor (optional)
    type: String,
    value: "",
  },
  cursorStyle: {
    // description: Style of the cursor. Options: "vertical-bar" or "i-beam"
    type: String,
    value: "vertical-bar",
  },
  cursorBlinkSpeed: {
    // description: How quickly the cursor blinks in milliseconds
    type: Number,
    value: 500,
  },
  cursorBlinkFade: {
    // description: If true, the cursor will fade in and out when it blinks
    type: Boolean,
    value: false,
  },
  cursorColor: {
    // description: Color of the cursor
    type: String,
    value: "#000000",
  },
};

customElements.define("codecabana-typewriter", c(Typewriter));
