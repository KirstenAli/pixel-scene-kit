import { Camera } from "./camera.js";
import { clipLineNear, clipPolygonNear } from "./clipping.js";
import { shadeColor } from "./color.js";
import { DepthBuffer } from "./depth-buffer.js";
import { clipScreenLine, rasterizeDepthLine, rasterizeTriangle } from "./rasterize.js";
import { cross, dot, normalize, subtractVectors } from "./vector.js";

const MODES = new Set(["wireframe", "hidden-line", "solid", "solid-wireframe"]);

function faceNormal(a, b, c) {
  return normalize(cross(subtractVectors(b, a), subtractVectors(c, a)));
}

function isFrontFacing(normal, point) {
  return dot(normal, { x: -point.x, y: -point.y, z: -point.z }) > 0;
}

function faceBrightness(normal, lightDirection, ambient, doubleSided) {
  const direct = dot(normal, lightDirection);
  const diffuse = doubleSided ? Math.abs(direct) : Math.max(0, direct);
  return ambient + (1 - ambient) * diffuse;
}

function validFace(vertices, face) {
  return face.length === 3 && face.every((index) => vertices[index]);
}

export class Scene {
  constructor(options = {}) {
    this.camera = options.camera ?? new Camera();
    this.mode = options.mode ?? "wireframe";
    this.objects = [];
    this.depthBuffer = null;
  }

  add(object) {
    this.objects.push(object);
    return object;
  }

  remove(object) {
    const index = this.objects.indexOf(object);
    if (index !== -1) this.objects.splice(index, 1);
    return this;
  }

  getDepthBuffer(frame) {
    if (
      !this.depthBuffer
      || this.depthBuffer.width !== frame.width
      || this.depthBuffer.height !== frame.height
    ) {
      this.depthBuffer = new DepthBuffer(frame.width, frame.height);
    } else {
      this.depthBuffer.clear();
    }
    return this.depthBuffer;
  }

  render(frame, options = {}) {
    const mode = options.mode ?? this.mode;
    if (!MODES.has(mode)) throw new TypeError(`Unknown render mode: ${mode}`);
    if (options.clear ?? true) frame.clear();

    const preparedObjects = this.objects
      .filter((object) => object.visible)
      .map((object) => {
        const worldVertices = object.worldVertices();
        return {
          object,
          viewVertices: worldVertices.map((point) => this.camera.toView(point)),
        };
      });

    if (mode === "wireframe") {
      this.renderEdges(frame, preparedObjects, null, options);
      return frame;
    }

    const depthBuffer = this.getDepthBuffer(frame);
    this.renderFaces(frame, preparedObjects, depthBuffer, mode, options);

    if (mode === "hidden-line" || mode === "solid-wireframe") {
      this.renderEdges(frame, preparedObjects, depthBuffer, options);
    }

    return frame;
  }

  renderFaces(frame, preparedObjects, depthBuffer, mode, options) {
    const requestedAmbient = options.ambient ?? 0.28;
    if (!Number.isFinite(requestedAmbient)) throw new TypeError("ambient must be a number");
    const ambient = Math.max(0, Math.min(1, requestedAmbient));
    const lightDirection = normalize({
      x: options.lightDirection?.x ?? -0.45,
      y: options.lightDirection?.y ?? 0.7,
      z: options.lightDirection?.z ?? 1,
    });
    const cullBackfaces = options.cullBackfaces ?? true;
    const lighting = options.lighting ?? true;

    for (const { object, viewVertices } of preparedObjects) {
      for (let faceIndex = 0; faceIndex < object.faces.length; faceIndex += 1) {
        const face = object.faces[faceIndex];
        if (!validFace(viewVertices, face)) continue;

        const original = face.map((index) => viewVertices[index]);
        const normal = faceNormal(...original);
        const frontFacing = isFrontFacing(normal, original[0]);
        if (cullBackfaces && !object.doubleSided && !frontFacing) continue;

        const clipped = clipPolygonNear(original, this.camera.near);
        if (clipped.length < 3) continue;

        const brightness = lighting
          ? faceBrightness(normal, lightDirection, ambient, object.doubleSided)
          : 1;
        const baseColor = object.faceColors[faceIndex] ?? object.color;
        const color = mode === "hidden-line" ? null : shadeColor(baseColor, brightness);

        for (let index = 1; index < clipped.length - 1; index += 1) {
          const projected = [clipped[0], clipped[index], clipped[index + 1]]
            .map((point) => this.camera.projectView(point, frame));
          if (projected.every(Boolean)) {
            rasterizeTriangle(frame, depthBuffer, ...projected, color);
          }
        }
      }
    }
  }

  renderEdges(frame, preparedObjects, depthBuffer, options) {
    for (const { object, viewVertices } of preparedObjects) {
      const color = options.wireColor ?? object.wireColor;

      for (const [startIndex, endIndex] of object.edges) {
        const start = viewVertices[startIndex];
        const end = viewVertices[endIndex];
        if (!start || !end) continue;

        const clipped = clipLineNear(start, end, this.camera.near);
        if (!clipped) continue;

        const projectedStart = this.camera.projectView(clipped[0], frame);
        const projectedEnd = this.camera.projectView(clipped[1], frame);
        if (!projectedStart || !projectedEnd) continue;
        const screenLine = clipScreenLine(
          projectedStart,
          projectedEnd,
          frame.width,
          frame.height,
        );
        if (!screenLine) continue;

        if (depthBuffer) {
          rasterizeDepthLine(
            frame,
            depthBuffer,
            screenLine[0],
            screenLine[1],
            color,
            options.edgeTolerance,
          );
        } else {
          frame.line(screenLine[0].x, screenLine[0].y, screenLine[1].x, screenLine[1].y, color);
        }
      }
    }
  }
}

export function createScene(options) {
  return new Scene(options);
}
