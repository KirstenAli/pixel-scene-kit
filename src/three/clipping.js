import { lerpVector } from "./vector.js";

function isInside(point, near) {
  return -point.z >= near;
}

function intersection(start, end, near) {
  const planeZ = -near;
  const amount = (planeZ - start.z) / (end.z - start.z);
  return lerpVector(start, end, amount);
}

export function clipLineNear(start, end, near) {
  const startInside = isInside(start, near);
  const endInside = isInside(end, near);

  if (!startInside && !endInside) return null;
  if (startInside && endInside) return [start, end];

  const clipped = intersection(start, end, near);
  return startInside ? [start, clipped] : [clipped, end];
}

export function clipPolygonNear(points, near) {
  if (points.length === 0) return [];

  const output = [];
  let previous = points.at(-1);
  let previousInside = isInside(previous, near);

  for (const current of points) {
    const currentInside = isInside(current, near);

    if (currentInside !== previousInside) {
      output.push(intersection(previous, current, near));
    }
    if (currentInside) output.push(current);

    previous = current;
    previousInside = currentInside;
  }

  return output;
}
