import { Object3D } from "./object.js";

function resolveIndex(token, vertexCount) {
  const rawIndex = Number.parseInt(token.split("/")[0], 10);
  if (!Number.isInteger(rawIndex) || rawIndex === 0) {
    throw new Error(`Invalid OBJ vertex index: ${token}`);
  }
  return rawIndex > 0 ? rawIndex - 1 : vertexCount + rawIndex;
}

function edgeKey(a, b) {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function parseVertex(values, line) {
  if (values.length < 3) throw new Error(`Invalid OBJ vertex: ${line}`);

  const [x, y, z] = values.slice(0, 3).map(Number);
  if (![x, y, z].every(Number.isFinite)) {
    throw new Error(`Invalid OBJ vertex: ${line}`);
  }

  return { x, y, z };
}

function parsePolygon(values, vertexCount, line) {
  if (values.length < 3) throw new Error(`Invalid OBJ face: ${line}`);

  const polygon = values.map((token) => resolveIndex(token, vertexCount));
  if (polygon.some((index) => index < 0 || index >= vertexCount)) {
    throw new Error(`OBJ face references a missing vertex: ${line}`);
  }

  return polygon;
}

function triangulatePolygon(polygon) {
  const triangles = [];
  for (let index = 1; index < polygon.length - 1; index += 1) {
    triangles.push([polygon[0], polygon[index], polygon[index + 1]]);
  }
  return triangles;
}

function addPolygonEdges(polygon, edges, edgeKeys) {
  for (let index = 0; index < polygon.length; index += 1) {
    const start = polygon[index];
    const end = polygon[(index + 1) % polygon.length];
    const key = edgeKey(start, end);

    if (!edgeKeys.has(key)) {
      edges.push([start, end]);
      edgeKeys.add(key);
    }
  }
}

export function parseOBJ(source, options = {}) {
  if (typeof source !== "string") throw new TypeError("OBJ source must be a string");

  const vertices = [];
  const faces = [];
  const edges = [];
  const edgeKeys = new Set();

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.split("#", 1)[0].trim();
    if (!line) continue;

    const [command, ...values] = line.split(/\s+/);
    if (command === "v") {
      vertices.push(parseVertex(values, line));
    }

    if (command === "f") {
      const polygon = parsePolygon(values, vertices.length, line);
      faces.push(...triangulatePolygon(polygon));
      addPolygonEdges(polygon, edges, edgeKeys);
    }
  }

  if (vertices.length === 0) throw new Error("OBJ contains no vertices");
  return new Object3D(vertices, edges, { ...options, faces });
}

export async function loadOBJ(url, options = {}) {
  const fetchFunction = options.fetch ?? globalThis.fetch;
  if (typeof fetchFunction !== "function") throw new Error("loadOBJ requires fetch");

  const response = await fetchFunction(url);
  if (!response.ok) throw new Error(`Could not load OBJ: ${response.status} ${response.statusText}`);

  const { fetch: _fetch, ...objectOptions } = options;
  return parseOBJ(await response.text(), objectOptions);
}
