import { Object3D } from "./object.js";

export function createCube(options = {}) {
  const half = (options.size ?? 1) / 2;
  const vertices = [
    { x: -half, y: -half, z: -half },
    { x: half, y: -half, z: -half },
    { x: half, y: half, z: -half },
    { x: -half, y: half, z: -half },
    { x: -half, y: -half, z: half },
    { x: half, y: -half, z: half },
    { x: half, y: half, z: half },
    { x: -half, y: half, z: half },
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  const faces = [
    [0, 3, 2], [0, 2, 1],
    [4, 5, 6], [4, 6, 7],
    [0, 1, 5], [0, 5, 4],
    [3, 7, 6], [3, 6, 2],
    [0, 4, 7], [0, 7, 3],
    [1, 2, 6], [1, 6, 5],
  ];

  return new Object3D(vertices, edges, { ...options, faces });
}

export function createPyramid(options = {}) {
  const half = (options.size ?? 1) / 2;
  const height = options.height ?? options.size ?? 1;
  const vertices = [
    { x: -half, y: -half, z: -half },
    { x: half, y: -half, z: -half },
    { x: half, y: -half, z: half },
    { x: -half, y: -half, z: half },
    { x: 0, y: height - half, z: 0 },
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [0, 4], [1, 4], [2, 4], [3, 4],
  ];
  const faces = [
    [0, 1, 2], [0, 2, 3],
    [0, 4, 1], [1, 4, 2], [2, 4, 3], [3, 4, 0],
  ];

  return new Object3D(vertices, edges, { ...options, faces });
}
