export async function nextFrame() {
  return new Promise(requestAnimationFrame);
}
