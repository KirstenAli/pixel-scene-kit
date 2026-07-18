import { Object3D } from "../src/index.js";

function createMeshBuilder() {
  const vertices = [];
  const edges = [];
  const faces = [];

  function point(x, y, z) {
    vertices.push({ x, y, z });
    return vertices.length - 1;
  }

  function edge(start, end) {
    edges.push([start, end]);
  }

  function face(a, b, c) {
    faces.push([a, b, c]);
  }

  function quad(a, b, c, d) {
    face(a, b, c);
    face(a, c, d);
  }

  function path(points) {
    const indexes = points.map(([x, y, z]) => point(x, y, z));
    for (let index = 1; index < indexes.length; index += 1) {
      edge(indexes[index - 1], indexes[index]);
    }
    return indexes;
  }

  function ring(section, segments = 8) {
    const indexes = [];
    for (let index = 0; index < segments; index += 1) {
      const angle = (index / segments) * Math.PI * 2;
      indexes.push(point(
        section.x,
        section.y + Math.cos(angle) * section.radiusY,
        section.z + Math.sin(angle) * section.radiusZ,
      ));
    }
    for (let index = 0; index < segments; index += 1) {
      edge(indexes[index], indexes[(index + 1) % segments]);
    }
    return indexes;
  }

  function tube(sections, segments = 8) {
    const rings = sections.map((section) => ring(section, segments));
    for (let ringIndex = 1; ringIndex < rings.length; ringIndex += 1) {
      for (let pointIndex = 0; pointIndex < segments; pointIndex += 1) {
        const next = (pointIndex + 1) % segments;
        const previousRing = rings[ringIndex - 1];
        const currentRing = rings[ringIndex];
        edge(previousRing[pointIndex], currentRing[pointIndex]);
        quad(
          previousRing[pointIndex],
          previousRing[next],
          currentRing[next],
          currentRing[pointIndex],
        );
      }
    }

    const firstSection = sections[0];
    const lastSection = sections.at(-1);
    const startCenter = point(firstSection.x, firstSection.y, firstSection.z);
    const endCenter = point(lastSection.x, lastSection.y, lastSection.z);
    for (let index = 0; index < segments; index += 1) {
      const next = (index + 1) % segments;
      face(startCenter, rings[0][next], rings[0][index]);
      face(endCenter, rings.at(-1)[index], rings.at(-1)[next]);
    }
    return rings;
  }

  function box(min, max) {
    const corners = [
      point(min.x, min.y, min.z),
      point(max.x, min.y, min.z),
      point(max.x, max.y, min.z),
      point(min.x, max.y, min.z),
      point(min.x, min.y, max.z),
      point(max.x, min.y, max.z),
      point(max.x, max.y, max.z),
      point(min.x, max.y, max.z),
    ];
    for (const [start, end] of [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ]) edge(corners[start], corners[end]);
    for (const [a, b, c, d] of [
      [0, 3, 2, 1],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [3, 7, 6, 2],
      [0, 4, 7, 3],
      [1, 2, 6, 5],
    ]) quad(corners[a], corners[b], corners[c], corners[d]);
    return corners;
  }

  return { vertices, edges, faces, point, edge, face, path, tube, box };
}

function addBody(builder) {
  builder.tube([
    { x: -1.4, y: 0, z: 0, radiusY: 0.5, radiusZ: 0.48 },
    { x: -0.7, y: 0.05, z: 0, radiusY: 0.72, radiusZ: 0.68 },
    { x: 0.1, y: 0.08, z: 0, radiusY: 0.78, radiusZ: 0.72 },
    { x: 0.85, y: 0.18, z: 0, radiusY: 0.58, radiusZ: 0.55 },
    { x: 1.35, y: 0.5, z: 0, radiusY: 0.38, radiusZ: 0.4 },
    { x: 1.75, y: 0.82, z: 0, radiusY: 0.3, radiusZ: 0.33 },
  ]);
}

function addTail(builder) {
  builder.tube([
    { x: -4.3, y: 0.55, z: 0.48, radiusY: 0.025, radiusZ: 0.025 },
    { x: -3.85, y: 0.18, z: 0.52, radiusY: 0.1, radiusZ: 0.1 },
    { x: -3.3, y: -0.18, z: 0.38, radiusY: 0.17, radiusZ: 0.17 },
    { x: -2.7, y: -0.35, z: 0.18, radiusY: 0.25, radiusZ: 0.25 },
    { x: -2.05, y: -0.12, z: 0.05, radiusY: 0.35, radiusZ: 0.34 },
    { x: -1.4, y: 0, z: 0, radiusY: 0.48, radiusZ: 0.46 },
  ], 6);
}

function addHead(builder) {
  const head = builder.box(
    { x: 1.68, y: 0.55, z: -0.42 },
    { x: 2.55, y: 1.25, z: 0.42 },
  );
  const snout = builder.box(
    { x: 2.45, y: 0.62, z: -0.34 },
    { x: 3.12, y: 1.02, z: 0.34 },
  );

  builder.edge(head[1], snout[0]);
  builder.edge(head[2], snout[3]);
  builder.edge(head[5], snout[4]);
  builder.edge(head[6], snout[7]);

  builder.path([[1.82, 1.2, -0.28], [1.55, 1.75, -0.4], [1.82, 1.5, -0.3]]);
  builder.path([[1.82, 1.2, 0.28], [1.55, 1.75, 0.4], [1.82, 1.5, 0.3]]);
  builder.path([[2.9, 0.62, -0.28], [2.72, 0.42, -0.25], [2.45, 0.55, -0.3]]);
  builder.path([[2.9, 0.62, 0.28], [2.72, 0.42, 0.25], [2.45, 0.55, 0.3]]);

  const leftEye = builder.point(2.45, 1.16, -0.43);
  const rightEye = builder.point(2.45, 1.16, 0.43);
  builder.edge(leftEye, leftEye);
  builder.edge(rightEye, rightEye);
}

function addWing(builder, side) {
  const rootFront = builder.point(0.65, 0.55, side * 0.45);
  const rootBack = builder.point(-0.85, 0.48, side * 0.52);
  const elbow = builder.point(-0.15, 2.45, side * 1.65);
  const tip = builder.point(-2.65, 1.75, side * 3.15);
  const outer = builder.point(0.4, 1.2, side * 2.75);
  const notch = builder.point(-1.15, 0.95, side * 2.35);

  for (const [start, end] of [
    [rootFront, rootBack], [rootBack, elbow], [elbow, tip],
    [tip, notch], [notch, outer], [outer, rootFront],
    [rootBack, tip], [rootFront, elbow], [rootFront, notch], [elbow, outer],
  ]) builder.edge(start, end);

  for (const triangle of [
    [rootFront, rootBack, elbow],
    [rootFront, elbow, tip],
    [rootFront, tip, notch],
    [rootFront, notch, outer],
  ]) {
    builder.face(...triangle);
    builder.face(...[...triangle].reverse());
  }
}

function addLeg(builder, x, side, direction) {
  const hip = builder.point(x, -0.35, side * 0.5);
  const knee = builder.point(x + direction * 0.28, -1.05, side * 0.72);
  const ankle = builder.point(x + direction * 0.05, -1.65, side * 0.78);
  const foot = builder.point(x + direction * 0.52, -1.72, side * 0.8);

  builder.edge(hip, knee);
  builder.edge(knee, ankle);
  builder.edge(ankle, foot);

  for (const offset of [-0.18, 0, 0.18]) {
    const toe = builder.point(
      x + direction * 0.72,
      -1.76,
      side * 0.8 + offset,
    );
    builder.edge(foot, toe);
  }
}

function addSpines(builder) {
  const spine = [
    [-2.9, 0.05, 0], [-2.65, 0.55, 0],
    [-2.3, 0.22, 0], [-1.95, 0.78, 0],
    [-1.55, 0.45, 0], [-1.15, 1.0, 0],
    [-0.7, 0.76, 0], [-0.2, 1.2, 0],
    [0.3, 0.82, 0], [0.75, 1.18, 0],
    [1.15, 0.72, 0],
  ];
  builder.path(spine);
}

export function createDragon(options = {}) {
  const builder = createMeshBuilder();

  addBody(builder);
  addTail(builder);
  addHead(builder);
  addWing(builder, -1);
  addWing(builder, 1);
  addLeg(builder, -0.75, -1, -1);
  addLeg(builder, -0.75, 1, -1);
  addLeg(builder, 0.65, -1, 1);
  addLeg(builder, 0.65, 1, 1);
  addSpines(builder);

  return new Object3D(builder.vertices, builder.edges, {
    color: options.color ?? "#78f7cf",
    wireColor: options.wireColor ?? "#baffea",
    faces: builder.faces,
    position: options.position,
    rotation: options.rotation,
    scale: options.scale,
  });
}
