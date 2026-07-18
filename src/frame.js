import { drawCircle } from "./draw/circle.js";
import { drawLine } from "./draw/line.js";
import { drawRect } from "./draw/rect.js";

function assertSize(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
}

export class Frame {
  constructor(width, height, options = {}) {
    assertSize(width, "width");
    assertSize(height, "height");

    this.width = width;
    this.height = height;
    this.background = options.background ?? null;
    this.color = options.color ?? true;
    this.pixels = new Array(width * height).fill(this.background);
  }

  pixel(x, y, color = this.color) {
    x = Math.round(x);
    y = Math.round(y);

    if (this.has(x, y)) {
      this.pixels[y * this.width + x] = color;
    }

    return this;
  }

  get(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    return this.has(x, y) ? this.pixels[y * this.width + x] : undefined;
  }

  has(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  clear(color = this.background) {
    this.pixels.fill(color);
    return this;
  }

  line(x1, y1, x2, y2, color = this.color) {
    drawLine(this, x1, y1, x2, y2, color);
    return this;
  }

  rect(x, y, width, height, color = this.color, options = {}) {
    drawRect(this, x, y, width, height, color, options);
    return this;
  }

  circle(cx, cy, radius, color = this.color, options = {}) {
    drawCircle(this, cx, cy, radius, color, options);
    return this;
  }

  toArray() {
    return [...this.pixels];
  }
}

export function createFrame(width, height, options) {
  return new Frame(width, height, options);
}
