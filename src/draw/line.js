export function drawLine(frame, x1, y1, x2, y2, color) {
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  x2 = Math.round(x2);
  y2 = Math.round(y2);

  const dx = Math.abs(x2 - x1);
  const sx = x1 < x2 ? 1 : -1;
  const dy = -Math.abs(y2 - y1);
  const sy = y1 < y2 ? 1 : -1;
  let error = dx + dy;

  while (true) {
    frame.pixel(x1, y1, color);

    if (x1 === x2 && y1 === y2) return;

    const twiceError = error * 2;
    if (twiceError >= dy) {
      error += dy;
      x1 += sx;
    }
    if (twiceError <= dx) {
      error += dx;
      y1 += sy;
    }
  }
}
