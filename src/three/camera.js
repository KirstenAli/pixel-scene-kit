import { inverseRotate } from "./rotation.js";
import { vector3 } from "./vector.js";

export class Camera {
  constructor(options = {}) {
    const fov = options.fov ?? 60;
    const near = options.near ?? 0.1;

    if (!Number.isFinite(fov) || fov <= 0 || fov >= 180) {
      throw new TypeError("fov must be between 0 and 180 degrees");
    }
    if (!Number.isFinite(near) || near <= 0) {
      throw new TypeError("near must be a positive number");
    }

    this.position = vector3(options.position ?? { z: 5 });
    this.rotation = vector3(options.rotation);
    this.fov = fov;
    this.near = near;
  }

  toView(point) {
    const relative = {
      x: point.x - this.position.x,
      y: point.y - this.position.y,
      z: point.z - this.position.z,
    };
    return inverseRotate(relative, this.rotation);
  }

  projectView(view, frame) {
    const depth = -view.z;

    if (depth < this.near) return null;

    const radians = (this.fov * Math.PI) / 180;
    const focalLength = frame.width / 2 / Math.tan(radians / 2);

    return {
      x: frame.width / 2 + (view.x * focalLength) / depth,
      y: frame.height / 2 - (view.y * focalLength) / depth,
      depth,
    };
  }

  project(point, frame) {
    return this.projectView(this.toView(point), frame);
  }
}

export function createCamera(options) {
  return new Camera(options);
}
