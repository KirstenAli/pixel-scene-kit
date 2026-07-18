import test from "node:test";
import assert from "node:assert/strict";

import { createFrame } from "../src/index.js";

test("creates a frame and turns on one pixel", () => {
  const frame = createFrame(4, 3);

  const result = frame.pixel(2, 1);

  assert.equal(result, frame);
  assert.equal(frame.get(2, 1), true);
  assert.equal(frame.get(0, 0), null);
});

test("supports colors, rounding, clipping, and clearing", () => {
  const frame = createFrame(3, 3, { background: "black", color: "white" });

  frame.pixel(1.4, 1.6, "red").pixel(-1, 2).pixel(8, 8);

  assert.equal(frame.get(1, 2), "red");
  assert.equal(frame.get(-1, 2), undefined);
  assert.equal(frame.toArray().filter((pixel) => pixel === "red").length, 1);

  frame.clear();
  assert.deepEqual(frame.toArray(), new Array(9).fill("black"));
});

test("rejects invalid frame sizes", () => {
  assert.throws(() => createFrame(0, 5), /width must be a positive integer/);
  assert.throws(() => createFrame(5, 1.5), /height must be a positive integer/);
});
