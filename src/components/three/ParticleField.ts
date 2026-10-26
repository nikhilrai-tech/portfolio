import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  DynamicDrawUsage,
  LineBasicMaterial,
  LineSegments,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import type { Shape } from "./shapes";

export type Placement = { x: number; y: number; scale: number; opacity: number };
export type Frame = { a: number; b: number; mix: number; placeA: Placement; placeB: Placement };

const FOV = 40;
const CAM_Z = 8;
export const VISIBLE_H = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180);
const MAX_SHAPES = 7;
const NODE_COUNT = 140;
const MAX_SEGMENTS = 420;
const SPIN = 0.12; // globe spin, radians per second

const PALETTE = {
  dark: { a: "#63c7d9", b: "#eba73f", c: "#e9ebee", line: "#63c7d9" },
  light: { a: "#0e7c8f", b: "#9a5a00", c: "#0f1318", line: "#0e7c8f" },
};

const vertexShader = /* glsl */ `
  attribute vec3 aS0; attribute vec3 aS1; attribute vec3 aS2; attribute vec3 aS3;
  attribute vec3 aS4; attribute vec3 aS5; attribute vec3 aS6;
  attribute float aRand;
  uniform float uA, uB, uMix, uTime, uSize, uPixelRatio;
  uniform vec4 uPlaceA, uPlaceB; // x, y, scale, opacity
  uniform vec3 uMouse;           // x, y, strength
  uniform vec3 uColA, uColB, uColC;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 shapeAt(float i) {
    if (i < 0.5) return aS0;
    if (i < 1.5) return aS1;
    if (i < 2.5) return aS2;
    if (i < 3.5) return aS3;
    if (i < 4.5) return aS4;
    if (i < 5.5) return aS5;
    return aS6;
  }

  vec3 place(float i, vec4 pl) {
    vec3 p = shapeAt(i);
    if (i < 0.5) { // the globe turns slowly
      float s = sin(uTime * ${SPIN.toFixed(3)}), c = cos(uTime * ${SPIN.toFixed(3)});
      p = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
    }
    return vec3(pl.xy, 0.0) + p * pl.z;
  }

  void main() {
    // Each particle starts its move a little later than the last, so shapes dissolve and re-form.
    float m = clamp((uMix - aRand * 0.35) / 0.65, 0.0, 1.0);
    m = m * m * (3.0 - 2.0 * m);
    vec3 p = mix(place(uA, uPlaceA), place(uB, uPlaceB), m);
    float scale = mix(uPlaceA.z, uPlaceB.z, m);

    vec3 burst = vec3(sin(aRand * 91.0), cos(aRand * 57.0), sin(aRand * 23.0));
    p += burst * sin(m * 3.14159) * 0.45 * scale;
    p += 0.012 * scale * vec3(sin(uTime * 0.9 + aRand * 40.0), cos(uTime * 0.7 + aRand * 30.0), 0.0);

    // Push away from the cursor.
    vec2 d = p.xy - uMouse.xy;
    float dist = length(d);
    float radius = 0.9;
    float f = (1.0 - smoothstep(0.0, radius, dist)) * uMouse.z;
    p.xy += normalize(d + 1e-4) * f * 0.45;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRand * 0.9) / -mv.z;

    float pick = fract(aRand * 13.37);
    vColor = pick < 0.16 ? uColB : (pick < 0.32 ? uColC : uColA);
    vAlpha = mix(uPlaceA.w, uPlaceB.w, m) * (0.45 + 0.55 * fract(aRand * 7.1)) * (1.0 + f * 1.4);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

export class ParticleField {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  private material: ShaderMaterial;
  private geometry = new BufferGeometry();
  private shapes: Shape[];
  private rands: Float32Array;
  private nodes: number[];
  private lineGeo = new BufferGeometry();
  private lineMat = new LineBasicMaterial({ transparent: true, opacity: 0.55, depthWrite: false });
  private linePos = new Float32Array(MAX_SEGMENTS * 6);
  private mouse = { x: 0, y: 0, strength: 0, target: 0 };
  private rig = new Group();
  private tilt = { x: 0, y: 0 };
  private frame: Frame | null = null;
  private raf = 0;
  private born = performance.now();
  private width = 1;
  private height = 1;

  constructor(
    canvas: HTMLCanvasElement,
    shapes: Shape[],
    private opts: { dpr: number; onFrame: () => Frame | null },
  ) {
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(opts.dpr);
    this.camera.position.z = CAM_Z;
    this.shapes = shapes;
    const count = shapes[0].length / 3;

    this.rands = new Float32Array(count);
    for (let i = 0; i < count; i++) this.rands[i] = Math.random();
    this.geometry.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    for (let s = 0; s < MAX_SHAPES; s++) {
      this.geometry.setAttribute(
        `aS${s}`,
        new BufferAttribute(shapes[Math.min(s, shapes.length - 1)], 3),
      );
    }
    this.geometry.setAttribute("aRand", new BufferAttribute(this.rands, 1));
    // Positions come from the shader, so skip frustum culling on stale bounds.
    this.geometry.boundingSphere = null;

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uA: { value: 0 },
        uB: { value: 0 },
        uMix: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 26 },
        uPixelRatio: { value: opts.dpr },
        uPlaceA: { value: [0, 0, 1, 1] },
        uPlaceB: { value: [0, 0, 1, 1] },
        uMouse: { value: [0, 0, 0] },
        uColA: { value: new Color() },
        uColB: { value: new Color() },
        uColC: { value: new Color() },
      },
    });
    const points = new Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.scene.add(this.rig);
    this.rig.add(points);

    this.nodes = Array.from({ length: NODE_COUNT }, (_, i) => Math.floor((i * count) / NODE_COUNT));
    const lineAttr = new BufferAttribute(this.linePos, 3);
    lineAttr.setUsage(DynamicDrawUsage);
    this.lineGeo.setAttribute("position", lineAttr);
    this.lineGeo.setDrawRange(0, 0);
    const lines = new LineSegments(this.lineGeo, this.lineMat);
    lines.frustumCulled = false;
    this.rig.add(lines);

    this.setTheme(false);
  }

  /** Swap in a shape that loaded late (the portrait). */
  replaceShape(index: number, shape: Shape) {
    this.shapes[index] = shape;
    const attr = this.geometry.getAttribute(`aS${index}`) as BufferAttribute;
    (attr.array as Float32Array).set(shape);
    attr.needsUpdate = true;
  }

  setTheme(light: boolean) {
    const p = light ? PALETTE.light : PALETTE.dark;
    const u = this.material.uniforms;
    (u.uColA.value as Color).set(p.a);
    (u.uColB.value as Color).set(p.b);
    (u.uColC.value as Color).set(p.c);
    this.lineMat.color.set(p.line);
    // Additive light vanishes on a light page, so blend normally there.
    this.material.blending = light ? NormalBlending : AdditiveBlending;
    this.lineMat.blending = light ? NormalBlending : AdditiveBlending;
    this.material.needsUpdate = true;
    this.lineMat.needsUpdate = true;
    u.uSize.value = light ? 30 : 26;
  }

  setPointer(ndcX: number, ndcY: number, inside: boolean) {
    const visibleW = VISIBLE_H * (this.width / this.height);
    this.mouse.x = (ndcX * visibleW) / 2;
    this.mouse.y = (ndcY * VISIBLE_H) / 2;
    this.mouse.target = inside ? 1 : 0;
  }

  /** Device tilt, in radians (small values: about ±0.3). */
  setTilt(x: number, y: number) {
    this.tilt.x = x;
    this.tilt.y = y;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /** Converts a DOM rect (CSS pixels) to a placement on the z = 0 plane. */
  placementFor(
    rect: { left: number; top: number; width: number; height: number },
    fill: number,
    opacity: number,
  ): Placement {
    const visibleW = VISIBLE_H * (this.width / this.height);
    const cx = ((rect.left + rect.width / 2) / this.width) * 2 - 1;
    const cy = -(((rect.top + rect.height / 2) / this.height) * 2 - 1);
    const size = Math.min(
      (rect.width / this.width) * visibleW,
      (rect.height / this.height) * VISIBLE_H,
    );
    return { x: (cx * visibleW) / 2, y: (cy * VISIBLE_H) / 2, scale: (size / 2) * fill, opacity };
  }

  start() {
    if (this.raf) return;
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.render();
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private render() {
    const f = this.opts.onFrame() ?? this.frame;
    if (!f) return;
    this.frame = f;
    const t = (performance.now() - this.born) / 1000;
    this.mouse.strength += (this.mouse.target - this.mouse.strength) * 0.08;
    this.rig.rotation.x += (this.tilt.x - this.rig.rotation.x) * 0.06;
    this.rig.rotation.y += (this.tilt.y - this.rig.rotation.y) * 0.06;
    const u = this.material.uniforms;
    u.uA.value = f.a;
    u.uB.value = f.b;
    u.uMix.value = f.mix;
    u.uTime.value = t;
    u.uPlaceA.value = [f.placeA.x, f.placeA.y, f.placeA.scale, f.placeA.opacity];
    u.uPlaceB.value = [f.placeB.x, f.placeB.y, f.placeB.scale, f.placeB.opacity];
    u.uMouse.value = [this.mouse.x, this.mouse.y, this.mouse.strength];
    this.updateLines(f, t);
    this.renderer.render(this.scene, this.camera);
  }

  /** Mirrors the shader on the CPU for a few nodes, then links the ones near the cursor. */
  private updateLines(f: Frame, t: number) {
    const strength = this.mouse.strength;
    if (strength < 0.02) {
      this.lineGeo.setDrawRange(0, 0);
      return;
    }
    const s = Math.sin(t * SPIN);
    const c = Math.cos(t * SPIN);
    const pos = (shapeIndex: number, i: number, pl: Placement): [number, number] => {
      const sh = this.shapes[shapeIndex];
      let x = sh[i * 3];
      const z = sh[i * 3 + 2];
      if (shapeIndex === 0) x = c * x + s * z;
      return [pl.x + x * pl.scale, pl.y + sh[i * 3 + 1] * pl.scale];
    };
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const near: [number, number][] = [];
    for (const i of this.nodes) {
      let m = Math.min(1, Math.max(0, (f.mix - this.rands[i] * 0.35) / 0.65));
      m = m * m * (3 - 2 * m);
      const [ax, ay] = pos(f.a, i, f.placeA);
      const [bx, by] = pos(f.b, i, f.placeB);
      const x = ax + (bx - ax) * m;
      const y = ay + (by - ay) * m;
      if (Math.hypot(x - mx, y - my) < 1.6) near.push([x, y]);
    }
    let k = 0;
    const push = (x1: number, y1: number, x2: number, y2: number) => {
      if (k >= MAX_SEGMENTS) return;
      this.linePos.set([x1, y1, 0, x2, y2, 0], k * 6);
      k++;
    };
    for (let i = 0; i < near.length; i++) {
      for (let j = i + 1; j < near.length; j++) {
        if (Math.hypot(near[i][0] - near[j][0], near[i][1] - near[j][1]) < 0.55)
          push(...near[i], ...near[j]);
      }
    }
    near
      .map((p) => ({ p, d: Math.hypot(p[0] - mx, p[1] - my) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 5)
      .forEach(({ p }) => push(mx, my, p[0], p[1]));
    (this.lineGeo.getAttribute("position") as BufferAttribute).needsUpdate = true;
    this.lineGeo.setDrawRange(0, k * 2);
    this.lineMat.opacity = 0.34 * strength * Math.max(f.placeA.opacity, 0.3);
  }

  dispose() {
    this.stop();
    this.geometry.dispose();
    this.material.dispose();
    this.lineGeo.dispose();
    this.lineMat.dispose();
    this.renderer.dispose();
  }
}
