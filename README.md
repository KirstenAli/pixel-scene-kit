# Pixel Scene Kit

Start with a pixel. End up with a dragon.

Pixel Scene Kit is a small JavaScript software renderer. At the bottom is a plain grid of pixels; on top of that are a few 2D drawing tools, a camera, triangle rasterisation, lighting, and a depth buffer. There is no WebGL and there are no runtime dependencies.

I wanted the path from `frame.pixel(10, 12)` to a rotating 3D mesh to stay visible and understandable. The code is deliberately split into small modules so you can read it, change it, or borrow the interesting parts for your own experiments.

## A dead-simple tour

You do not need to understand 3D maths before using this library. Start with one idea:

> Everything eventually becomes coloured pixels in a frame.

The 3D code is just a way of deciding which pixels to colour. The snippets below use these imports, and the final example puts the important pieces together:

```js
import {
  animate,
  createCanvasRenderer,
  createCube,
  createFrame,
  createScene,
  Object3D,
} from "pixel-scene-kit";
```

### 1. The frame is graph paper

Imagine a small sheet of graph paper. Every square has an `x` position, a `y` position, and a value.

```js
const frame = createFrame(8, 6);
frame.pixel(2, 3, "red");
```

That turns one square red. The frame only stores the result in memory; it does not put anything on your monitor yet.

The 2D drawing helpers colour several squares for you:

```js
frame.line(0, 0, 7, 5, "white");
frame.rect(1, 1, 4, 3, "yellow");
frame.circle(4, 3, 2, "cyan");
```

Easy way to think about it: **the frame is the picture being built**.

### 2. The canvas renderer is the display

The canvas renderer copies the finished frame onto an HTML canvas:

```js
const screen = createCanvasRenderer(document.querySelector("canvas"), {
  scale: 10,
});

screen.render(frame);
```

Easy way to think about it: **the frame holds the picture; the canvas renderer shows it**.

### 3. Animation is a flipbook

Animation repeatedly builds and displays a new picture:

```js
animate(() => {
  frame.clear();
  frame.pixel(2, 3, "red");
  screen.render(frame);
});
```

The old picture is cleared. The objects are moved. A new picture is drawn. This happens many times per second, like pages in a flipbook.

### 4. A 3D point is an address inside a room

A screen position needs two numbers:

```js
{ x: 2, y: 3 }
```

A position inside a room needs one extra number:

```js
{ x: 2, y: 3, z: 4 }
```

- `x` says left or right.
- `y` says up or down.
- `z` says nearer or farther away.

Easy way to think about it: **`x`, `y`, and `z` are the address of one dot in a room**.

### 5. Three dots make one face

An `Object3D` begins with a list of 3D dots called vertices:

```js
const vertices = [
  { x: -1, y: -1, z: 0 }, // dot 0
  { x: 1, y: -1, z: 0 },  // dot 1
  { x: 0, y: 1, z: -1 },  // dot 2
];
```

A face tells the renderer to join three dots and colour the area inside them:

```js
const faces = [
  [0, 1, 2],
];
```

`[0, 1, 2]` means: use dots 0, 1, and 2 as the three corners of a filled triangle.

```text
       dot 2
         ●
        /█\
       /███\
      /█████\
dot 0 ●───────● dot 1
```

A triangle is flat, but it can be tilted and placed inside a 3D room, just like a flat sheet of paper can be tilted in a real room. Lots of these flat faces joined together make the dragon's outer skin.

Easy way to think about it: **vertices are dots; faces are filled patches between the dots; a mesh is all the patches joined together**.

### 6. An object is a movable mesh

`Object3D` combines the dots and faces and gives them a shared position, rotation, scale, and colour:

```js
const triangle = new Object3D(vertices, [], {
  faces,
  color: "cyan",
});

triangle.position.x = 1;
triangle.rotation.y = 0.5;
triangle.scale.y = 2;
```

Changing the object moves all its vertices together. The original mesh does not have to be rewritten.

Easy way to think about it: **an object is a toy you can pick up, move, turn, or resize**.

### 7. The scene is the tabletop

The scene keeps track of all the objects:

```js
const scene = createScene();
const cube = createCube();

scene.add(triangle);
scene.add(cube);
```

Calling `scene.render(frame)` asks the scene to turn all its 3D objects into pixels:

```js
scene.render(frame);
```

Easy way to think about it: **the scene is a tabletop holding all your toys**.

### 8. The camera is your eye

The camera decides where the scene is viewed from. The default camera sits in front of the origin and looks towards it.

A camera turns each 3D vertex into a 2D screen position. This is called projection. It is the same basic thing a real camera does when it turns a room into a flat photograph.

Near objects appear larger. Far objects appear smaller. The `z` information is also kept as a distance so the renderer can decide what is in front.

Easy way to think about it: **the camera is your eye, and projection is the photograph it sees**.

### 9. The rasterizer colours the triangle's pixels

After the camera projects a face, it has three corners on the 2D screen:

```text
          ●
         / \
        /   \
       /     \
      ●───────●
```

The rasterizer finds the screen pixels inside those corners and colours them:

```text
          ●
         /█\
        /███\
       /█████\
      ●███████●
```

Easy way to think about it: **the rasterizer is a colouring pen that stays inside the triangle**.

### 10. The depth buffer makes the nearest surface win

One screen pixel can line up with several parts of an object:

```text
camera -> screen pixel -> near wing -> body -> far wing
```

Only the near wing should be visible. The depth buffer stores the distance of the nearest surface found for every pixel.

```text
near wing: 3 units away  -> draw it
body:      5 units away  -> hidden
far wing:  8 units away  -> hidden
```

Easy way to think about it: **every pixel has a closest-wins contest**.

The depth buffer is cleared for every new animation frame, so visibility is recalculated after the dragon moves or rotates.

### 11. The whole flow

Here is the complete renderer without the implementation details:

```text
create a frame
    -> put objects in a scene
    -> move or rotate the objects
    -> the camera turns 3D vertices into 2D positions
    -> the rasterizer colours pixels inside each face
    -> the depth buffer keeps the closest surface at each pixel
    -> the frame now contains the finished picture
    -> the canvas renderer displays it
    -> repeat for the next animation frame
```

In code, the part you use stays small:

```js
const frame = createFrame(64, 48);
const screen = createCanvasRenderer(document.querySelector("canvas"), {
  scale: 10,
});
const scene = createScene({ mode: "solid-wireframe" });
const cube = scene.add(createCube());

animate(({ delta }) => {
  cube.rotation.y += delta;
  scene.render(frame);
  screen.render(frame);
});
```

`scene.render(frame)` does the camera, triangle, lighting, clipping, and depth work. `screen.render(frame)` displays the resulting pixels.

### Component cheat sheet

| Component | Job | Easy way to remember it |
| --- | --- | --- |
| `Frame` | Stores the current pixels | Graph paper |
| Drawing helpers | Turn lines, rectangles, and circles into pixels | Pens and shape tools |
| Canvas renderer | Displays the frame | The screen |
| `animate` | Builds pictures repeatedly | A flipbook |
| Vertices | Store 3D points | Dots in a room |
| Faces | Fill the area between three vertices | Flat patches of skin |
| `Object3D` | Holds and moves one mesh | A movable toy |
| Scene | Holds and renders the objects | A tabletop |
| Camera | Chooses the viewpoint and projects 3D into 2D | Your eye taking a photo |
| Rasterizer | Finds pixels inside projected triangles | A colouring pen |
| Depth buffer | Keeps the nearest surface at each pixel | Closest wins |
| Lighting | Makes faces lighter or darker | A lamp |
| Clipping | Cuts away geometry that crosses the camera boundary | Camera-safe scissors |

If you are reading the source, a friendly order is `frame.js`, the files in `draw/`, `renderers/canvas.js`, `three/object.js`, `three/camera.js`, and finally `three/scene.js`. You can stop at any point; each layer builds on the one before it.

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
