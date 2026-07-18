# Pixel Scene Kit

Start with a pixel. End up with a dragon.

Pixel Scene Kit starts with a grid you can colour one pixel at a time, then builds upward into 2D drawing, animation, cameras, meshes, lighting, and solid 3D scenes. It is written in plain JavaScript, with no WebGL and no runtime dependencies.

I wanted the path from `frame.pixel(10, 12)` to a rotating 3D mesh to stay visible and understandable. The code is deliberately split into small modules so you can read it, change it, or borrow the interesting parts for your own experiments.

## A dead-simple tour

You do not need to understand 3D maths before using this library. Start with one idea:

> Everything eventually becomes coloured pixels in a frame.

The 3D code is just a way of deciding which pixels to colour. The snippets below use these imports, and the final example puts the important pieces together:

```js
import {
  animate,
  createCamera,
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

### 5. A face selects three dots

An `Object3D` begins with a list of 3D dots called vertices:

```js
const vertices = [
  { x: -1, y: -1, z: 0 }, // dot 0
  { x: 1, y: -1, z: 0 },  // dot 1
  { x: 0, y: 1, z: -1 },  // dot 2
];
```

A face is a small piece of data that selects three vertices:

```js
const faces = [
  [0, 1, 2],
];
```

`[0, 1, 2]` means: vertices 0, 1, and 2 are the corners of one triangular surface.

```text
       dot 2
         ●
        / \
       /   \
      /     \
dot 0 ●───────● dot 1
```

A face does not project anything and does not colour any pixels. It only says which three dots belong to the same surface. Projection and rasterisation happen later.

A triangle is flat, but it can be tilted and placed inside a 3D room, just like a flat sheet of paper can be tilted in a real room. Lots of these flat faces joined together make the dragon's outer skin.

Easy way to think about it: **vertices are dots; a face chooses three dots; a mesh is all those triangular surfaces joined together**.

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

The constructor has three parts:

```js
new Object3D(vertices, edges, options);
```

The empty `[]` above means that no separate outline edges were supplied. The solid face can still be rendered. Leaving out outlines gives a cleaner solid surface; adding edges gives a technical, pixel-art, or cartoon outline.

Changing the object moves all its vertices together. The original mesh does not have to be rewritten.

A dragon is normally one `Object3D` containing many vertices and faces. It can instead be split into several objects—for example, a body and two wings—when those parts need to move independently.

Easy way to think about it: **an object is a toy you can pick up, move, turn, or resize**.

### 7. The scene is the tabletop

The scene keeps track of all the objects:

```js
const scene = createScene({ mode: "solid" });
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

Projection does not change the real 3D object. It calculates where each of its vertices should appear in the 2D frame. For the same left/right or up/down offset, a larger depth produces a smaller offset on screen. That is why a whole object usually looks smaller as it moves away from the camera.

The core calculation is:

```text
screen position = screen centre + position × zoom ÷ distance
```

Pixel Scene Kit expresses that calculation like this:

```js
const depth = -view.z;

const screenX = frame.width / 2
  + (view.x * focalLength) / depth;

const screenY = frame.height / 2
  - (view.y * focalLength) / depth;
```

`view` is the vertex position relative to the camera. `focalLength` acts like zoom and is calculated from the camera's field of view. Screen Y uses subtraction because canvas coordinates increase downwards.

Here is one actual vertex on a 20 by 12 frame. The camera is at `z: 5`, the field of view is 90 degrees, and that gives a focal length of 10:

```js
const frame = createFrame(20, 12);
const camera = createCamera({
  position: { z: 5 },
  fov: 90,
});

const vertex = { x: 2, y: 1, z: 0 };
const projected = camera.project(vertex, frame);

// approximately { x: 14, y: 4, depth: 5 }
```

The X calculation is:

```text
10 + (2 × 10 ÷ 5) = 14
```

If the same point moves twice as far away, its screen offset is halved:

```text
close, depth 5:  10 + (2 × 10 ÷ 5)  = 14
far, depth 10:   10 + (2 × 10 ÷ 10) = 12
```

Projection repeats this calculation for every vertex. As an object moves away, its projected vertices normally move closer together, so the complete triangle, cube, or dragon looks smaller.

Easy way to think about it: **the camera is your eye, and projection is the photograph it sees**.

### 9. The rasterizer finds the pixels covered by a triangle

At this point the jobs are separate:

```text
face       -> chooses three 3D vertices
projection -> calculates three 2D screen positions
rasterizer -> finds the candidate pixels inside those screen positions
depth test -> decides which candidate surface is visible at each pixel
frame      -> stores the winning colour
```

The renderer's flow is approximately:

```js
const face = [0, 1, 2];
const triangle3D = face.map((index) => viewVertices[index]);
const triangle2D = triangle3D.map((point) => camera.projectView(point, frame));

rasterizeTriangle(
  frame,
  depthBuffer,
  triangle2D[0],
  triangle2D[1],
  triangle2D[2],
  "cyan",
);
```

After the camera projects a face, it has three corners on the 2D screen:

```text
          ●
         / \
        /   \
       /     \
      ●───────●
```

The rasterizer finds the screen pixels inside those corners and calculates a depth for each one:

```text
          ●
         /█\
        /███\
       /█████\
      ●███████●
```

Those are candidate pixels. Before a colour is written, the depth buffer checks whether that part of the triangle is closer than anything already found there.

Easy way to think about it: **the rasterizer is a stencil that says which pixels the triangle covers; the depth buffer decides which stencil is on top**.

### 10. The depth buffer makes the nearest surface win

The depth buffer exists to answer one question:

> If several surfaces want to colour the same screen pixel, which surface is actually visible?

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

It is an invisible grid the same size as the frame. The frame stores colours; the depth buffer stores the closest distance found at each pixel:

```text
colour frame pixel: cyan
depth buffer pixel: 3
```

The depth buffer starts each new animation frame filled with infinity, meaning nothing has been seen yet. Whenever the rasterizer finds a candidate pixel, the renderer performs this test. This simplified version matches the decision made for solid triangles:

```js
if (newDepth <= savedDepth) {
  if (newDepth < savedDepth) save(newDepth);
  frame.pixel(x, y, color);
}
```

A nearby wing at depth 3 replaces a body at depth 5. A far wing at depth 8 is rejected. This works per pixel, so only the overlapping part is hidden, and it works regardless of which object was rendered first.

The buffer is cleared for every new animation frame, so visibility is recalculated after the dragon moves or rotates. Hidden-line mode also uses it to stop far-side outlines showing through solid faces.

### 11. The whole flow

Here is the complete renderer without the implementation details:

```text
create a frame
    -> put objects in a scene
    -> move or rotate the objects
    -> the camera turns 3D vertices into 2D positions
    -> the rasterizer finds candidate pixels inside each projected triangle
    -> the depth buffer accepts the closest surface at each pixel
    -> accepted colours are written into the frame
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
| Faces | Select three vertices that form one surface | A note joining three dots |
| `Object3D` | Holds and moves one mesh | A movable toy |
| Scene | Holds and renders the objects | A tabletop |
| Camera | Chooses the viewpoint and projects every vertex into 2D | Your eye taking a photo |
| Rasterizer | Finds candidate pixels inside the three projected corners | A triangle stencil |
| Depth buffer | Decides which surface is visible at every pixel | Closest wins |
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

![The pixel dragon shown at three points in its rotation](https://raw.githubusercontent.com/KirstenAli/pixel-scene-kit/main/docs/dragon-rotation.png)

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

Flat lighting shades hexadecimal colours such as `#29c99b` and `rgb(...)` colours. Other valid canvas colour strings still render, but are used without automatic lightening or darkening.

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

OBJ is a plain-text format for storing a 3D model. It is not the same thing as Pixel Scene Kit's `Object3D` class.

This complete OBJ file describes one triangle:

```obj
v -1 -1 0
v  1 -1 0
v  0  1 0

f 1 2 3
```

Each `v` line stores one vertex as `x y z`. The `f` line says that vertices 1, 2, and 3 form one face. OBJ counts vertices from 1; JavaScript arrays and `Object3D` faces count from 0. The loader converts the OBJ indexes for you, then turns the text into an `Object3D`:

```text
.obj text -> vertices and faces -> Object3D -> scene -> pixels
```

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

The package is not on the npm registry yet. Until the first npm release, install it directly from GitHub:

```sh
npm install github:KirstenAli/pixel-scene-kit
```

After it is published to npm, the command will be:

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
