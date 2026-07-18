import test from "node:test";
import assert from "node:assert/strict";

import { createFrame, createScene } from "../src/index.js";
import { createDragon } from "../examples/dragon-model.js";

test("the example dragon is a valid solid mesh", () => {
  const dragon = createDragon();

  assert.ok(dragon.vertices.length > 100);
  assert.ok(dragon.edges.length > 100);
  assert.ok(dragon.faces.length > 100);
  assert.ok(dragon.vertices.every((vertex) => (
    Number.isFinite(vertex.x)
    && Number.isFinite(vertex.y)
    && Number.isFinite(vertex.z)
  )));
  assert.ok(dragon.edges.every(([start, end]) => (
    start >= 0
    && end >= 0
    && start < dragon.vertices.length
    && end < dragon.vertices.length
  )));
  assert.ok(dragon.faces.every((face) => (
    face.length === 3
    && face.every((index) => index >= 0 && index < dragon.vertices.length)
  )));

  const frame = createFrame(100, 70);
  const scene = createScene();
  scene.add(dragon);
  scene.render(frame, { mode: "solid-wireframe" });

  assert.ok(frame.toArray().filter(Boolean).length > 100);

  for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    dragon.rotation.y = angle;
    scene.render(frame, { mode: "solid" });
    assert.ok(frame.toArray().filter(Boolean).length > 100);
  }
});
