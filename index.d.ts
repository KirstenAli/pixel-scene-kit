export type Pixel = string | boolean | null | undefined;
export type Vector3 = { x: number; y: number; z: number };
export type PartialVector3 = Partial<Vector3>;
export type Edge = [number, number];
export type Face = [number, number, number];
export type RenderMode = "wireframe" | "hidden-line" | "solid" | "solid-wireframe";

export class Frame {
  readonly width: number;
  readonly height: number;
  background: Pixel;
  color: Pixel;
  readonly pixels: Pixel[];
  constructor(width: number, height: number, options?: FrameOptions);
  pixel(x: number, y: number, color?: Pixel): this;
  get(x: number, y: number): Pixel;
  has(x: number, y: number): boolean;
  clear(color?: Pixel): this;
  line(x1: number, y1: number, x2: number, y2: number, color?: Pixel): this;
  rect(x: number, y: number, width: number, height: number, color?: Pixel, options?: FillOptions): this;
  circle(cx: number, cy: number, radius: number, color?: Pixel, options?: FillOptions): this;
  toArray(): Pixel[];
}

export interface FrameOptions {
  background?: Pixel;
  color?: Pixel;
}

export interface FillOptions {
  fill?: boolean;
}

export function createFrame(width: number, height: number, options?: FrameOptions): Frame;

export interface CanvasRendererOptions {
  scale?: number;
  gap?: number;
  foreground?: string;
  background?: string;
}

export interface CanvasRenderer {
  render(frame: Frame): void;
}

export function createCanvasRenderer(
  canvas: HTMLCanvasElement,
  options?: CanvasRendererOptions,
): CanvasRenderer;

export interface AnimationFrame {
  time: number;
  delta: number;
}

export interface AnimationOptions {
  requestFrame?: (callback: FrameRequestCallback) => number;
  cancelFrame?: (id: number) => void;
}

export function animate(
  update: (frame: AnimationFrame) => void,
  options?: AnimationOptions,
): () => void;

export interface CameraOptions {
  position?: PartialVector3;
  rotation?: PartialVector3;
  fov?: number;
  near?: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  depth: number;
}

export class Camera {
  position: Vector3;
  rotation: Vector3;
  fov: number;
  near: number;
  constructor(options?: CameraOptions);
  toView(point: Vector3): Vector3;
  projectView(point: Vector3, frame: Frame): ProjectedPoint | null;
  project(point: Vector3, frame: Frame): ProjectedPoint | null;
}

export function createCamera(options?: CameraOptions): Camera;

export class DepthBuffer {
  width: number;
  height: number;
  readonly values: Float64Array;
  constructor(width: number, height: number);
  resize(width: number, height: number): this;
  clear(): this;
  get(x: number, y: number): number | undefined;
  has(x: number, y: number): boolean;
  testAndSet(x: number, y: number, depth: number, tolerance?: number): boolean;
}

export interface Object3DOptions {
  position?: PartialVector3;
  rotation?: PartialVector3;
  scale?: PartialVector3;
  color?: Pixel;
  wireColor?: Pixel;
  faces?: Face[];
  faceColors?: Pixel[];
  doubleSided?: boolean;
  visible?: boolean;
}

export class Object3D {
  readonly vertices: Vector3[];
  readonly edges: Edge[];
  readonly faces: Face[];
  readonly faceColors: Pixel[];
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  color: Pixel;
  wireColor: Pixel;
  doubleSided: boolean;
  visible: boolean;
  constructor(vertices: PartialVector3[], edges: Edge[], options?: Object3DOptions);
  worldVertices(): Vector3[];
}

export function parseOBJ(source: string, options?: Object3DOptions): Object3D;

export interface LoadOBJOptions extends Object3DOptions {
  fetch?: typeof globalThis.fetch;
}

export function loadOBJ(url: string | URL, options?: LoadOBJOptions): Promise<Object3D>;

export interface ShapeOptions extends Object3DOptions {
  size?: number;
}

export interface PyramidOptions extends ShapeOptions {
  height?: number;
}

export function createCube(options?: ShapeOptions): Object3D;
export function createPyramid(options?: PyramidOptions): Object3D;

export interface SceneOptions {
  camera?: Camera;
  mode?: RenderMode;
}

export interface SceneRenderOptions {
  clear?: boolean;
  mode?: RenderMode;
  ambient?: number;
  lightDirection?: PartialVector3;
  lighting?: boolean;
  cullBackfaces?: boolean;
  wireColor?: Pixel;
  edgeTolerance?: number;
}

export class Scene {
  camera: Camera;
  mode: RenderMode;
  readonly objects: Object3D[];
  depthBuffer: DepthBuffer | null;
  constructor(options?: SceneOptions);
  add<T extends Object3D>(object: T): T;
  remove(object: Object3D): this;
  getDepthBuffer(frame: Frame): DepthBuffer;
  render(frame: Frame, options?: SceneRenderOptions): Frame;
}

export function createScene(options?: SceneOptions): Scene;
