function edgeFunction(a, b, x, y) {
  return (x - a.x) * (b.y - a.y) - (y - a.y) * (b.x - a.x);
}

function interpolateProjected(start, end, amount) {
  const inverseDepth = (1 - amount) / start.depth + amount / end.depth;
  return {
    x: start.x + (end.x - start.x) * amount,
    y: start.y + (end.y - start.y) * amount,
    depth: 1 / inverseDepth,
  };
}

export function clipScreenLine(start, end, width, height) {
  const differenceX = end.x - start.x;
  const differenceY = end.y - start.y;
  const p = [-differenceX, differenceX, -differenceY, differenceY];
  const q = [start.x, width - 1 - start.x, start.y, height - 1 - start.y];
  let minimum = 0;
  let maximum = 1;

  for (let index = 0; index < p.length; index += 1) {
    if (p[index] === 0) {
      if (q[index] < 0) return null;
      continue;
    }

    const amount = q[index] / p[index];
    if (p[index] < 0) minimum = Math.max(minimum, amount);
    else maximum = Math.min(maximum, amount);
    if (minimum > maximum) return null;
  }

  return [
    interpolateProjected(start, end, minimum),
    interpolateProjected(start, end, maximum),
  ];
}

export function rasterizeTriangle(frame, depthBuffer, a, b, c, color) {
  const area = edgeFunction(a, b, c.x, c.y);
  if (Math.abs(area) < Number.EPSILON) return;

  const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
  const maxX = Math.min(frame.width - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
  const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
  const maxY = Math.min(frame.height - 1, Math.ceil(Math.max(a.y, b.y, c.y)));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const sampleX = x + 0.5;
      const sampleY = y + 0.5;
      const weightA = edgeFunction(b, c, sampleX, sampleY) / area;
      const weightB = edgeFunction(c, a, sampleX, sampleY) / area;
      const weightC = 1 - weightA - weightB;

      if (weightA < -1e-8 || weightB < -1e-8 || weightC < -1e-8) continue;

      const inverseDepth = (
        weightA / a.depth
        + weightB / b.depth
        + weightC / c.depth
      );
      const depth = 1 / inverseDepth;

      if (depthBuffer.testAndSet(x, y, depth) && color !== null) {
        frame.pixel(x, y, color);
      }
    }
  }
}

export function rasterizeDepthLine(frame, depthBuffer, start, end, color, tolerance = 0.025) {
  const differenceX = end.x - start.x;
  const differenceY = end.y - start.y;
  const steps = Math.max(Math.abs(differenceX), Math.abs(differenceY));

  if (steps === 0) {
    const x = Math.round(start.x);
    const y = Math.round(start.y);
    if (depthBuffer.testAndSet(x, y, start.depth, tolerance)) frame.pixel(x, y, color);
    return;
  }

  for (let step = 0; step <= Math.ceil(steps); step += 1) {
    const amount = step / Math.ceil(steps);
    const x = Math.round(start.x + differenceX * amount);
    const y = Math.round(start.y + differenceY * amount);
    const inverseDepth = (1 - amount) / start.depth + amount / end.depth;
    const depth = 1 / inverseDepth;

    if (depthBuffer.testAndSet(x, y, depth, tolerance)) frame.pixel(x, y, color);
  }
}
