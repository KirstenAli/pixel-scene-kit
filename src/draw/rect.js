export function drawRect(frame, x, y, width, height, color, options = {}) {
  x = Math.round(x);
  y = Math.round(y);
  width = Math.round(width);
  height = Math.round(height);

  if (width <= 0 || height <= 0) return;

  if (options.fill) {
    for (let row = y; row < y + height; row += 1) {
      for (let column = x; column < x + width; column += 1) {
        frame.pixel(column, row, color);
      }
    }
    return;
  }

  const right = x + width - 1;
  const bottom = y + height - 1;
  frame.line(x, y, right, y, color);
  frame.line(right, y, right, bottom, color);
  frame.line(right, bottom, x, bottom, color);
  frame.line(x, bottom, x, y, color);
}
