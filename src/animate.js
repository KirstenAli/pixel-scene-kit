export function animate(update, options = {}) {
  if (typeof update !== "function") {
    throw new TypeError("update must be a function");
  }

  const requestFrame = options.requestFrame ?? globalThis.requestAnimationFrame;
  const cancelFrame = options.cancelFrame ?? globalThis.cancelAnimationFrame;

  if (typeof requestFrame !== "function" || typeof cancelFrame !== "function") {
    throw new Error("animate requires requestAnimationFrame and cancelAnimationFrame");
  }

  let frameId;
  let previousTime;
  let running = true;

  function tick(milliseconds) {
    if (!running) return;

    const time = milliseconds / 1000;
    const delta = previousTime === undefined ? 0 : (milliseconds - previousTime) / 1000;
    previousTime = milliseconds;
    update({ time, delta });

    if (running) frameId = requestFrame(tick);
  }

  frameId = requestFrame(tick);

  return function stop() {
    if (!running) return;
    running = false;
    cancelFrame(frameId);
  };
}
