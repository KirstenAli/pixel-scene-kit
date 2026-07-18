export function vector3(value = {}) {
  return {
    x: value.x ?? 0,
    y: value.y ?? 0,
    z: value.z ?? 0,
  };
}

export function scaleVector(point, scale) {
  return {
    x: point.x * scale.x,
    y: point.y * scale.y,
    z: point.z * scale.z,
  };
}

export function addVectors(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function subtractVectors(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function normalize(value) {
  const length = Math.hypot(value.x, value.y, value.z);
  if (length === 0) return { x: 0, y: 0, z: 0 };
  return { x: value.x / length, y: value.y / length, z: value.z / length };
}

export function lerpVector(a, b, amount) {
  return {
    x: a.x + (b.x - a.x) * amount,
    y: a.y + (b.y - a.y) * amount,
    z: a.z + (b.z - a.z) * amount,
  };
}
