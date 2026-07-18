import test from "node:test";
import assert from "node:assert/strict";

import {
  createCamera,
  createCube,
  createFrame,
  createPyramid,
  createScene,
} from "../src/index.js";

test("projects the world origin into the center of a frame", () => {
  const camera = createCamera({ position: { z: 5 } });
  const frame = createFrame(80, 60);

  assert.deepEqual(camera.project({ x: 0, y: 0, z: 0 }, frame), {
    x: 40,
    y: 30,
    depth: 5,
  });
  assert.equal(camera.project({ x: 0, y: 0, z: 6 }, frame), null);
});

test("rejects invalid camera settings", () => {
  assert.throws(() => createCamera({ fov: 180 }), /between 0 and 180/);
  assert.throws(() => createCamera({ near: 0 }), /positive number/);
});

test("renders, moves, and removes a cube", () => {
  const frame = createFrame(40, 30);
  const scene = createScene();
  const cube = scene.add(createCube({ size: 2, color: "lime" }));

  assert.equal(scene.render(frame), frame);
  assert.ok(frame.toArray().includes("lime"));

  const before = cube.worldVertices();
  cube.position.x = 1;
  cube.rotation.y = Math.PI / 4;
  const after = cube.worldVertices();
  assert.notDeepEqual(after, before);

  scene.remove(cube).render(frame);
  assert.ok(frame.toArray().every((pixel) => pixel === null));
});

test("creates a pyramid and preserves partial scale defaults", () => {
  const pyramid = createPyramid({ size: 2, scale: { y: 2 } });

  assert.deepEqual(pyramid.scale, { x: 1, y: 2, z: 1 });
  assert.equal(pyramid.vertices.length, 5);
  assert.equal(pyramid.edges.length, 8);
});
