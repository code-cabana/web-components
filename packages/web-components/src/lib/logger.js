const msgPrefix = "[CC]";

export function debug(...args) {
  console.info(msgPrefix, ...args);
}

export function error(...args) {
  console.error(msgPrefix, ...args);
}
