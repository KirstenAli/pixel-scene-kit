function parseHex(color) {
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color);
  if (!match) return null;

  const hex = match[1].length === 3
    ? [...match[1]].map((character) => character + character).join("")
    : match[1];

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function parseRgb(color) {
  const match = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(color);
  if (!match) return null;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
}

export function shadeColor(color, intensity) {
  if (typeof color !== "string") return color;

  const rgb = parseHex(color) ?? parseRgb(color);
  if (!rgb) return color;

  const shade = (channel) => Math.max(0, Math.min(255, Math.round(channel * intensity)));
  return `rgb(${shade(rgb.r)}, ${shade(rgb.g)}, ${shade(rgb.b)})`;
}
