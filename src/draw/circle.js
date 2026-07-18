function horizontalLine(frame, x1, x2, y, color) {
  for (let x = x1; x <= x2; x += 1) frame.pixel(x, y, color);
}

export function drawCircle(frame, cx, cy, radius, color, options = {}) {
  cx = Math.round(cx);
  cy = Math.round(cy);
  radius = Math.round(radius);

  if (radius < 0) return;

  let x = radius;
  let y = 0;
  let error = 1 - radius;

  while (x >= y) {
    if (options.fill) {
      horizontalLine(frame, cx - x, cx + x, cy + y, color);
      horizontalLine(frame, cx - x, cx + x, cy - y, color);
      horizontalLine(frame, cx - y, cx + y, cy + x, color);
      horizontalLine(frame, cx - y, cx + y, cy - x, color);
    } else {
      frame.pixel(cx + x, cy + y, color);
      frame.pixel(cx + y, cy + x, color);
      frame.pixel(cx - y, cy + x, color);
      frame.pixel(cx - x, cy + y, color);
      frame.pixel(cx - x, cy - y, color);
      frame.pixel(cx - y, cy - x, color);
      frame.pixel(cx + y, cy - x, color);
      frame.pixel(cx + x, cy - y, color);
    }

    y += 1;
    if (error < 0) {
      error += 2 * y + 1;
    } else {
      x -= 1;
      error += 2 * (y - x + 1);
    }
  }
}
