import test from "node:test";
import assert from "node:assert/strict";

import { createCanvasRenderer, createFrame } from "../src/index.js";

function fakeCanvas() {
  const calls = [];
  const context = {
    fillStyle: undefined,
    fillRect(...args) {
      calls.push({ color: this.fillStyle, args });
    },
  };

  return {
    canvas: {
      width: 0,
      height: 0,
      getContext: () => context,
    },
    calls,
  };
}

test("renders lit pixels to a canvas at the chosen scale", () => {
  const { canvas, calls } = fakeCanvas();
  const renderer = createCanvasRenderer(canvas, {
    scale: 4,
    gap: 0.5,
    background: "navy",
    foreground: "cyan",
  });
  const frame = createFrame(2, 2).pixel(1, 0).pixel(0, 1, "pink");

  renderer.render(frame);

  assert.equal(canvas.width, 8);
  assert.equal(canvas.height, 8);
  assert.deepEqual(calls, [
    { color: "navy", args: [0, 0, 8, 8] },
    { color: "cyan", args: [4.5, 0.5, 3, 3] },
    { color: "pink", args: [0.5, 4.5, 3, 3] },
  ]);
});

test("rejects invalid canvas and scale values", () => {
  assert.throws(() => createCanvasRenderer(null), /canvas-like/);
  assert.throws(
    () => createCanvasRenderer(fakeCanvas().canvas, { scale: 0 }),
    /positive number/,
  );
  assert.throws(
    () => createCanvasRenderer(fakeCanvas().canvas, { gap: -1 }),
    /non-negative number/,
  );
});
