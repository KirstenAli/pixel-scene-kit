import test from "node:test";
import assert from "node:assert/strict";

import { createFrame } from "../src/index.js";

function litPixels(frame) {
  const points = [];
  for (let y = 0; y < frame.height; y += 1) {
    for (let x = 0; x < frame.width; x += 1) {
      if (frame.get(x, y)) points.push([x, y]);
    }
  }
  return points;
}

test("draws lines with both endpoints", () => {
  const frame = createFrame(5, 5).line(0, 0, 4, 4);

  assert.deepEqual(litPixels(frame), [
    [0, 0], [1, 1], [2, 2], [3, 3], [4, 4],
  ]);
});

test("draws outlined and filled rectangles", () => {
  const outline = createFrame(5, 5).rect(1, 1, 3, 3);
  const filled = createFrame(5, 5).rect(1, 1, 3, 3, true, { fill: true });

  assert.equal(litPixels(outline).length, 8);
  assert.equal(outline.get(2, 2), null);
  assert.equal(litPixels(filled).length, 9);
  assert.equal(filled.get(2, 2), true);
});

test("draws outlined and filled circles", () => {
  const outline = createFrame(7, 7).circle(3, 3, 2);
  const filled = createFrame(7, 7).circle(3, 3, 2, true, { fill: true });

  assert.equal(outline.get(3, 1), true);
  assert.equal(outline.get(3, 3), null);
  assert.equal(filled.get(3, 3), true);
  assert.ok(litPixels(filled).length > litPixels(outline).length);
});
