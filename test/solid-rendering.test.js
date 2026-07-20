import test from "node:test";
import assert from "node:assert/strict";

import {
  createCamera,
  createCube,
  createFrame,
  createScene,
  DepthBuffer,
  loadOBJ,
  Object3D,
  parseOBJ,
} from "../src/index.js";

function triangleAt(z, color) {
  return new Object3D(
    [
      { x: -1, y: -1, z },
      { x: 1, y: -1, z },
      { x: 0, y: 1, z },
    ],
    [],
    { color, faces: [[0, 1, 2]] },
  );
}

test("a depth buffer keeps the closest pixel", () => {
  const depth = new DepthBuffer(3, 2);

  assert.equal(depth.testAndSet(1, 1, 5), true);
  assert.equal(depth.testAndSet(1, 1, 7), false);
  assert.equal(depth.testAndSet(1, 1, 3), true);
  assert.equal(depth.get(1, 1), 3);

  depth.clear();
  assert.equal(depth.get(1, 1), Infinity);
});

test("solid rendering hides a farther triangle regardless of draw order", () => {
  const frame = createFrame(41, 41);
  const scene = createScene();

  scene.add(triangleAt(1, "#0000ff"));
  scene.add(triangleAt(0, "#ff0000"));
  scene.render(frame, { mode: "solid", lighting: false });

  assert.equal(frame.get(20, 20), "rgb(0, 0, 255)");
});

test("hidden-line mode removes edges behind solid faces", () => {
  const wireframe = createFrame(60, 60);
  const hiddenLine = createFrame(60, 60);
  const scene = createScene();
  scene.add(createCube({ size: 3 }));

  scene.render(wireframe, { mode: "wireframe" });
  scene.render(hiddenLine, { mode: "hidden-line" });

  const wireframePixels = wireframe.toArray().filter(Boolean).length;
  const hiddenPixels = hiddenLine.toArray().filter(Boolean).length;
  assert.ok(hiddenPixels > 0);
  assert.ok(hiddenPixels < wireframePixels);
});

test("triangles crossing the near plane are clipped and rendered", () => {
  const frame = createFrame(50, 50);
  const camera = createCamera({ position: { z: 0 }, near: 1 });
  const scene = createScene({ camera });
  const triangle = new Object3D(
    [
      { x: -1, y: -1, z: -2 },
      { x: 1, y: -1, z: -2 },
      { x: 0, y: 1, z: -0.5 },
    ],
    [],
    { color: "#ffffff", faces: [[0, 1, 2]] },
  );

  scene.add(triangle);
  scene.render(frame, { mode: "solid", lighting: false });

  assert.ok(frame.toArray().some(Boolean));
});

test("OBJ parsing triangulates faces and keeps polygon edges", () => {
  const mesh = parseOBJ(`
    v -1 -1 0
    v 1 -1 0
    v 1 1 0
    v -1 1 0
    f -4 -3 -2 -1 # inline comments are allowed
  `);

  assert.equal(mesh.vertices.length, 4);
  assert.equal(mesh.faces.length, 2);
  assert.equal(mesh.edges.length, 4);
});

test("OBJ parsing handles face tokens and reports invalid geometry", () => {
  const mesh = parseOBJ(`
    v 0 0 0
    v 1 0 0
    v 0 1 0
    f 1/4/7 2/5/7 3/6/7
  `);

  assert.deepEqual(mesh.vertices, [
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
  ]);
  assert.deepEqual(mesh.faces, [[0, 1, 2]]);

  assert.throws(
    () => parseOBJ("v 0 0 nope"),
    /Invalid OBJ vertex/,
  );
  assert.throws(
    () => parseOBJ("v 0 0 0\nf 1 2 3"),
    /missing vertex/,
  );
});

test("loadOBJ accepts an injectable fetch function", async () => {
  const mesh = await loadOBJ("dragon.obj", {
    fetch: async () => ({
      ok: true,
      text: async () => "v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3",
    }),
  });

  assert.equal(mesh.faces.length, 1);
});

test("built-in solids provide triangle faces", () => {
  assert.equal(createCube().faces.length, 12);
});

test("rejects unknown rendering modes", () => {
  assert.throws(
    () => createScene().render(createFrame(2, 2), { mode: "volumetric" }),
    /Unknown render mode/,
  );
});

test("clips projected edges to the framebuffer", () => {
  const frame = createFrame(20, 10);
  const scene = createScene();
  scene.add(new Object3D(
    [
      { x: -1_000_000, y: 0, z: 0 },
      { x: 1_000_000, y: 0, z: 0 },
    ],
    [[0, 1]],
  ));

  scene.render(frame);

  assert.equal(frame.toArray().filter(Boolean).length, 20);
});

test("accepts partial light directions and validates ambient light", () => {
  const frame = createFrame(20, 20);
  const scene = createScene();
  scene.add(createCube());

  scene.render(frame, { mode: "solid", lightDirection: { z: 1 } });
  assert.throws(
    () => scene.render(frame, { mode: "solid", ambient: Number.NaN }),
    /ambient must be a number/,
  );
});
