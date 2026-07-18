import { addVectors, scaleVector, vector3 } from "./vector.js";
import { rotate } from "./rotation.js";

export class Object3D {
  constructor(vertices, edges, options = {}) {
    this.vertices = vertices.map(vector3);
    this.edges = edges.map(([start, end]) => [start, end]);
    this.faces = (options.faces ?? []).map(([a, b, c]) => [a, b, c]);
    this.faceColors = [...(options.faceColors ?? [])];
    this.position = vector3(options.position);
    this.rotation = vector3(options.rotation);
    this.scale = {
      x: options.scale?.x ?? 1,
      y: options.scale?.y ?? 1,
      z: options.scale?.z ?? 1,
    };
    this.color = options.color ?? true;
    this.wireColor = options.wireColor ?? this.color;
    this.doubleSided = options.doubleSided ?? false;
    this.visible = options.visible ?? true;
  }

  worldVertices() {
    return this.vertices.map((vertex) => {
      const scaled = scaleVector(vertex, this.scale);
      const rotated = rotate(scaled, this.rotation);
      return addVectors(rotated, this.position);
    });
  }
}
