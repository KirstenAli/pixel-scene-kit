import test from "node:test";
import assert from "node:assert/strict";

import { animate } from "../src/index.js";

test("runs an animation with time and delta in seconds", () => {
  const callbacks = [];
  const cancelled = [];
  const updates = [];
  const requestFrame = (callback) => {
    callbacks.push(callback);
    return callbacks.length;
  };
  const cancelFrame = (id) => cancelled.push(id);

  const stop = animate((frame) => updates.push(frame), { requestFrame, cancelFrame });
  callbacks[0](1000);
  callbacks[1](1025);
  stop();
  stop();

  assert.deepEqual(updates, [
    { time: 1, delta: 0 },
    { time: 1.025, delta: 0.025 },
  ]);
  assert.deepEqual(cancelled, [3]);
});

test("requires a callback and animation frame functions", () => {
  assert.throws(() => animate(null), /update must be a function/);
  assert.throws(
    () => animate(() => {}, { requestFrame: null, cancelFrame: null }),
    /requires requestAnimationFrame/,
  );
});
