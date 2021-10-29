export { default as collapse } from "./collapse";

export async function nextFrame() {
  return new Promise(requestAnimationFrame);
}
