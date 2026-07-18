function assertCanvas(canvas) {
  if (!canvas || typeof canvas.getContext !== "function") {
    throw new TypeError("canvas must be a canvas-like object");
  }
}

export function createCanvasRenderer(canvas, options = {}) {
  assertCanvas(canvas);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create a 2D canvas context");

  const scale = options.scale ?? 8;
  const gap = options.gap ?? 0;
  const foreground = options.foreground ?? "#ffffff";
  const background = options.background ?? "#111111";

  if (!Number.isFinite(scale) || scale <= 0) {
    throw new TypeError("scale must be a positive number");
  }
  if (!Number.isFinite(gap) || gap < 0) {
    throw new TypeError("gap must be a non-negative number");
  }

  return {
    render(frame) {
      const width = frame.width * scale;
      const height = frame.height * scale;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;

      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < frame.height; y += 1) {
        for (let x = 0; x < frame.width; x += 1) {
          const value = frame.get(x, y);
          if (value === null || value === undefined || value === false) continue;

          context.fillStyle = value === true ? foreground : value;
          context.fillRect(
            x * scale + gap,
            y * scale + gap,
            Math.max(0, scale - gap * 2),
            Math.max(0, scale - gap * 2),
          );
        }
      }
    },
  };
}
