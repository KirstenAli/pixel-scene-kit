# Pixel Scene Kit

Start with a pixel. End up with a dragon.

Pixel Scene Kit is a small JavaScript software renderer. At the bottom is a plain grid of pixels; on top of that are a few 2D drawing tools, a camera, triangle rasterisation, lighting, and a depth buffer. There is no WebGL and there are no runtime dependencies.

I wanted the path from `frame.pixel(10, 12)` to a rotating 3D mesh to stay visible and understandable. The code is deliberately split into small modules so you can read it, change it, or borrow the interesting parts for your own experiments.

## The smallest useful example

```js
import { createFrame } from "pixel-scene-kit";

const frame = createFrame(64, 48);

frame
  .pixel(10, 12)
  .pixel(11, 12, "hotpink")
  .line(2, 2, 20, 16, "cyan")
  .rect(24, 8, 12, 10, "yellow")
  .circle(45, 24, 8, "white");
```

That frame is just an array of values. To see it in a browser, connect it to a canvas:

```html
<canvas id="screen"></canvas>
```

```js
import { createCanvasRenderer, createFrame } from "pixel-scene-kit";

const frame = createFrame(32, 24);
const screen = createCanvasRenderer(document.querySelector("#screen"), {
  scale: 12,
  gap: 1,
  background: "#10131a",
  foreground: "#ffffff",
});

frame.pixel(4, 5).line(6, 7, 20, 15, "cyan");
screen.render(frame);
```

`true` uses the renderer's foreground colour. CSS colour strings work too. `false`, `null`, and `undefined` are treated as unlit pixels.

## A rotating solid cube

The 3D API follows the same idea: update an object, render the scene into the frame, then display the frame.

```js
import {
  animate,
  createCanvasRenderer,
  createCube,
  createFrame,
  createScene,
} from "pixel-scene-kit";

const frame = createFrame(64, 48);
const screen = createCanvasRenderer(document.querySelector("canvas"), { scale: 10 });
const scene = createScene({ mode: "solid-wireframe" });
const cube = scene.add(createCube({
  size: 2,
  color: "#26c99a",
  wireColor: "#c8ffef",
}));

animate(({ delta }) => {
  cube.rotation.x += delta * 0.6;
  cube.rotation.y += delta;

  scene.render(frame);
  screen.render(frame);
});
```

The default camera is at `{ x: 0, y: 0, z: 5 }`, looking towards the origin. Positions, rotations, and scales are ordinary mutable objects. Rotations use radians.

## The dragon example

The dragon is a larger demonstration of the same public API. It has a procedural mesh, solid triangle faces, depth-tested outlines, simple lighting, a star field, and a complete 360-degree rotation.

- [`dragon.html`](examples/dragon.html) contains the page and presentation.
- [`dragon.js`](examples/dragon.js) sets up the frame, camera, scene, controls, and animation.
- [`dragon-model.js`](examples/dragon-model.js) builds the dragon from vertices, edges, and faces.

Run it from the repository root:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173/examples/dragon.html`. Drag horizontally to rotate the dragon yourself, or press Space to pause and resume automatic rotation.

The interesting part of the animation is intentionally uneventful:

```js
animate(({ time, delta }) => {
  dragon.rotation.y += delta * 0.38;
  dragon.position.y = Math.sin(time * 0.8) * 0.1;

  scene.render(frame, {
    mode: "solid-wireframe",
    ambient: 0.22,
    lightDirection: { x: -0.5, y: 0.8, z: 1 },
  });
  screen.render(frame);
});
```

There is also a smaller [`cube.html`](examples/cube.html) example if you want somewhere easier to start.

## Rendering modes

```js
const scene = createScene({ mode: "solid" });

scene.render(frame, {
  mode: "solid-wireframe",
  ambient: 0.25,
  lightDirection: { x: -0.5, y: 0.8, z: 1 },
});
```

| Mode | What it draws |
| --- | --- |
| `wireframe` | Every edge, including edges on the far side. |
| `hidden-line` | Only edges that are visible from the camera. |
| `solid` | Filled, flat-shaded triangle faces. |
| `solid-wireframe` | Solid faces with visible outlines drawn on top. |

Solid modes use one depth buffer for the whole scene. That means a nearby surface wins even when the farther object was added later. Geometry crossing the camera's near plane is clipped instead of suddenly disappearing.

## Building your own mesh

An `Object3D` has vertices, optional wireframe edges, and triangular faces:

```js
import { Object3D } from "pixel-scene-kit";

const triangle = new Object3D(
  [
    { x: -1, y: -1, z: 0 },
    { x: 1, y: -1, z: 0 },
    { x: 0, y: 1, z: 0 },
  ],
  [[0, 1], [1, 2], [2, 0]],
  {
    faces: [[0, 1, 2]],
    color: "#29c99b",
    wireColor: "white",
  },
);

scene.add(triangle);
```

List face vertices counter-clockwise when looking at the outside of the object. For an open surface that should be visible from both sides, set `doubleSided: true`. You can also provide one colour per face with `faceColors`.

## Loading an OBJ file

```js
import { loadOBJ, parseOBJ } from "pixel-scene-kit";

const dragon = await loadOBJ("./dragon.obj", {
  color: "#29c99b",
  wireColor: "#d4fff3",
});

scene.add(dragon);

const anotherMesh = parseOBJ(objText, { color: "#ff8ac5" });
```

Polygon faces are triangulated automatically, while their original boundary edges are kept for wireframe rendering. The loader reads geometry rather than the full OBJ ecosystem: materials, textures, UVs, and normal maps are not currently supported.

## What's in the package?

- A chainable pixel framebuffer
- Lines, rectangles, and circles
- A scaled HTML canvas renderer
- A `requestAnimationFrame` animation helper
- Cameras, scenes, transforms, and custom meshes
- Triangle rasterisation with perspective-correct depth
- Back-face culling, near-plane clipping, and flat lighting
- Wireframe, hidden-line, solid, and outlined-solid rendering
- OBJ parsing and loading
- TypeScript declarations

This is a CPU renderer made for small canvases, pixel art, learning, and experiments. It is not trying to compete with a GPU engine such as Three.js—and that is rather the point.

## Install and develop

```sh
npm install pixel-scene-kit
```

To work on the repository itself:

```sh
npm test
npm run check
```

The test suite uses Node's built-in test runner, so there are no development dependencies to install first.

## Licence

MIT
