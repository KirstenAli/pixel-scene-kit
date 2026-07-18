import {
  animate,
  createCamera,
  createCanvasRenderer,
  createFrame,
  createScene,
} from "../src/index.js";
import { createDragon } from "./dragon-model.js";

const frame = createFrame(100, 70);
const canvas = document.querySelector("#screen");
const screen = createCanvasRenderer(canvas, {
  scale: 9,
  gap: 0.65,
  background: "#050910",
  foreground: "#78f7cf",
});

const camera = createCamera({ position: { z: 11 }, fov: 48 });
const scene = createScene({ camera });
const dragon = scene.add(createDragon({
  scale: { x: 1.08, y: 1.08, z: 1.08 },
}));

const requestedAngle = new URLSearchParams(location.search).get("angle");
let angle = Number(requestedAngle) || 0;
let autoRotate = requestedAngle === null;
let previousPointerX;

canvas.addEventListener("pointerdown", (event) => {
  previousPointerX = event.clientX;
  autoRotate = false;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (previousPointerX === undefined) return;
  angle += (event.clientX - previousPointerX) * 0.012;
  previousPointerX = event.clientX;
});

canvas.addEventListener("pointerup", () => {
  previousPointerX = undefined;
});

addEventListener("keydown", (event) => {
  if (event.code === "Space") autoRotate = !autoRotate;
});

const stars = Array.from({ length: 42 }, (_, index) => ({
  x: (index * 37 + 11) % frame.width,
  y: (index * 19 + 7) % frame.height,
  phase: index * 0.71,
}));

animate(({ time, delta }) => {
  frame.clear();

  for (const star of stars) {
    if (Math.sin(time * 1.7 + star.phase) > 0.45) {
      frame.pixel(star.x, star.y, "#243f4d");
    }
  }

  if (autoRotate) angle += delta * 0.38;
  dragon.rotation.x = -0.16 + Math.sin(time * 0.55) * 0.05;
  dragon.rotation.y = angle;
  dragon.rotation.z = Math.sin(time * 0.45) * 0.025;
  dragon.position.y = Math.sin(time * 0.8) * 0.1;

  scene.render(frame, {
    clear: false,
    mode: "solid-wireframe",
    ambient: 0.22,
    lightDirection: { x: -0.5, y: 0.8, z: 1 },
  });
  screen.render(frame);
});
