export class DepthBuffer {
  constructor(width, height) {
    this.resize(width, height);
  }

  resize(width, height) {
    if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
      throw new TypeError("depth buffer dimensions must be positive integers");
    }

    this.width = width;
    this.height = height;
    this.values = new Float64Array(width * height);
    this.clear();
    return this;
  }

  clear() {
    this.values.fill(Infinity);
    return this;
  }

  get(x, y) {
    return this.has(x, y) ? this.values[y * this.width + x] : undefined;
  }

  has(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  testAndSet(x, y, depth, tolerance = 0) {
    if (!this.has(x, y) || !Number.isFinite(depth) || depth <= 0) return false;

    const index = y * this.width + x;
    if (depth > this.values[index] + tolerance) return false;

    if (depth < this.values[index]) this.values[index] = depth;
    return true;
  }
}
