// Point clouds for each section, all centred on the origin and fitting a radius of about 1.
// Every generator returns COUNT * 3 floats so the shader can morph any shape into any other.

export type Shape = Float32Array;

/** Small seeded PRNG so shapes look the same on every visit. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Writer = (x: number, y: number, z: number) => void;

function writer(out: Float32Array): [Writer, () => number] {
  let i = 0;
  const put: Writer = (x, y, z) => {
    if (i >= out.length) return;
    out[i++] = x;
    out[i++] = y;
    out[i++] = z;
  };
  return [put, () => i / 3];
}

function segment(
  put: Writer,
  r: () => number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  n: number,
  jitter = 0.012,
  z = 0.04,
) {
  for (let k = 0; k < n; k++) {
    const t = r();
    put(
      ax + (bx - ax) * t + (r() - 0.5) * jitter,
      ay + (by - ay) * t + (r() - 0.5) * jitter,
      (r() - 0.5) * z,
    );
  }
}

/** Fill whatever is left with copies of earlier points, so every shape has exactly `count`. */
function finish(out: Float32Array, written: number) {
  const count = out.length / 3;
  for (let i = written; i < count; i++) {
    const j = i % Math.max(1, written);
    out[i * 3] = out[j * 3];
    out[i * 3 + 1] = out[j * 3 + 1];
    out[i * 3 + 2] = out[j * 3 + 2];
  }
  return out;
}

function latLon(lat: number, lon: number): [number, number, number] {
  const phi = (lat * Math.PI) / 180;
  // Turn the globe so India (about 80°E) faces the camera.
  const theta = ((lon - 80) * Math.PI) / 180;
  return [Math.cos(phi) * Math.sin(theta), Math.sin(phi), Math.cos(phi) * Math.cos(theta)];
}

/** Globe with data arcs from Kanpur to the cloud regions used in production. */
export function globe(count: number): Shape {
  const out = new Float32Array(count * 3);
  const [put, n] = writer(out);
  const r = rng(1);
  const sphere = Math.floor(count * 0.7);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < sphere; i++) {
    const y = 1 - (i / (sphere - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    put(Math.cos(th) * rad, y, Math.sin(th) * rad);
  }
  const home = latLon(26.45, 80.33);
  const regions: [number, number][] = [
    [18.52, 73.86], // Azure Central India
    [12.97, 77.59], // DigitalOcean BLR1
    [1.35, 103.82], // Singapore
    [50.11, 8.68], // Frankfurt
    [51.51, -0.13], // London
    [38.9, -77.04], // AWS us-east-1
    [37.77, -122.42], // San Francisco
  ];
  const perArc = Math.floor((count - sphere) / regions.length);
  for (const [lat, lon] of regions) {
    const to = latLon(lat, lon);
    const dot = home[0] * to[0] + home[1] * to[1] + home[2] * to[2];
    const omega = Math.acos(Math.min(1, Math.max(-1, dot)));
    for (let k = 0; k < perArc; k++) {
      const t = r();
      const s = Math.sin(omega) || 1;
      const a = Math.sin((1 - t) * omega) / s;
      const b = Math.sin(t * omega) / s;
      const lift = 1 + Math.sin(Math.PI * t) * (0.12 + omega * 0.12);
      put(
        (home[0] * a + to[0] * b) * lift,
        (home[1] * a + to[1] * b) * lift,
        (home[2] * a + to[2] * b) * lift,
      );
    }
  }
  return finish(out, n());
}

/** Three server racks with unit slots, frames and status LEDs. */
export function rack(count: number): Shape {
  const out = new Float32Array(count * 3);
  const [put, n] = writer(out);
  const r = rng(2);
  const w = 0.5;
  const h = 1.9;
  const d = 0.45;
  const units = 12;
  for (const cx of [-0.62, 0, 0.62]) {
    const per = Math.floor(count / 3);
    const x0 = cx - w / 2;
    const x1 = cx + w / 2;
    const y0 = -h / 2;
    // frame edges
    const edges: [number, number, number, number, number, number][] = [
      [x0, y0, d / 2, x0, -y0, d / 2],
      [x1, y0, d / 2, x1, -y0, d / 2],
      [x0, -y0, d / 2, x1, -y0, d / 2],
      [x0, y0, d / 2, x1, y0, d / 2],
      [x0, y0, -d / 2, x0, -y0, -d / 2],
      [x1, y0, -d / 2, x1, -y0, -d / 2],
      [x0, -y0, -d / 2, x0, -y0, d / 2],
      [x1, -y0, -d / 2, x1, -y0, d / 2],
    ];
    for (const [ax, ay, az, bx, by, bz] of edges) {
      for (let k = 0; k < per * 0.035; k++) {
        const t = r();
        put(ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t);
      }
    }
    // unit faceplates: two slot lines and an LED cluster per unit
    for (let u = 0; u < units; u++) {
      const uy = y0 + 0.08 + (u * (h - 0.16)) / (units - 1);
      for (let k = 0; k < per * 0.035; k++) {
        const t = r();
        put(x0 + 0.05 + t * (w - 0.18), uy + (r() < 0.5 ? 0.025 : -0.025), d / 2);
      }
      for (let k = 0; k < per * 0.012; k++) {
        put(x1 - 0.07 + (r() - 0.5) * 0.03, uy + (r() - 0.5) * 0.03, d / 2 + 0.01);
      }
    }
  }
  return finish(out, n());
}

/** Microservice mesh: service nodes joined to their nearest neighbours. */
export function mesh(count: number): Shape {
  const out = new Float32Array(count * 3);
  const [put, n] = writer(out);
  const r = rng(3);
  const nodes: [number, number, number][] = [];
  while (nodes.length < 20) {
    const p: [number, number, number] = [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1];
    if (Math.hypot(...p) < 1) nodes.push([p[0] * 1.15, p[1], p[2] * 0.6]);
  }
  const clusterShare = Math.floor((count * 0.4) / nodes.length);
  for (const [x, y, z] of nodes) {
    for (let k = 0; k < clusterShare; k++) {
      const a = r() * Math.PI * 2;
      const b = Math.acos(2 * r() - 1);
      const rad = 0.07 * Math.cbrt(r());
      put(
        x + rad * Math.sin(b) * Math.cos(a),
        y + rad * Math.sin(b) * Math.sin(a),
        z + rad * Math.cos(b),
      );
    }
  }
  const links: [number, number][] = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) }))
      .filter((e) => e.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 3);
    near.forEach(({ j }) => i < j && links.push([i, j]));
  });
  const perLink = Math.floor((count * 0.6) / Math.max(1, links.length));
  for (const [i, j] of links) {
    const [a, b] = [nodes[i], nodes[j]];
    for (let k = 0; k < perLink; k++) {
      const t = r();
      put(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
    }
  }
  return finish(out, n());
}

/** Kubernetes-style helm: heptagon rim, hub and seven spokes. */
export function helm(count: number): Shape {
  const out = new Float32Array(count * 3);
  const [put, n] = writer(out);
  const r = rng(4);
  const sides = 7;
  const corner = (k: number, rad: number): [number, number] => {
    const a = Math.PI / 2 + (k / sides) * Math.PI * 2;
    return [Math.cos(a) * rad, Math.sin(a) * rad];
  };
  for (let k = 0; k < sides; k++) {
    const [ax, ay] = corner(k, 1);
    const [bx, by] = corner(k + 1, 1);
    segment(put, r, ax, ay, bx, by, Math.floor((count * 0.32) / sides), 0.06, 0.1);
  }
  for (let k = 0; k < Math.floor(count * 0.16); k++) {
    const a = r() * Math.PI * 2;
    const rad = 0.26 + (r() - 0.5) * 0.06;
    put(Math.cos(a) * rad, Math.sin(a) * rad, (r() - 0.5) * 0.08);
  }
  for (let k = 0; k < sides; k++) {
    const a = Math.PI / 2 + ((k + 0.5) / sides) * Math.PI * 2;
    const [sx, sy] = [Math.cos(a) * 0.3, Math.sin(a) * 0.3];
    const [ex, ey] = [Math.cos(a) * 0.78, Math.sin(a) * 0.78];
    segment(put, r, sx, sy, ex, ey, Math.floor((count * 0.36) / sides), 0.07, 0.08);
    // knob at the end of each spoke
    for (let m = 0; m < count * 0.01; m++) {
      const b = r() * Math.PI * 2;
      const rad = 0.07 * Math.sqrt(r());
      put(ex + Math.cos(b) * rad, ey + Math.sin(b) * rad, (r() - 0.5) * 0.06);
    }
  }
  return finish(out, n());
}

/** Shield with a padlock: security and access control. */
export function shield(count: number): Shape {
  const out = new Float32Array(count * 3);
  const [put, n] = writer(out);
  const r = rng(5);
  const outline = (s: number) => {
    const pts: [number, number][] = [];
    for (let t = 0; t <= 1; t += 0.02)
      pts.push([-0.78 + 1.56 * t, 0.86 + Math.sin(Math.PI * t) * 0.1]);
    for (let t = 0; t <= 1; t += 0.02) {
      const y = 0.86 - t * 1.86;
      const x = 0.78 * Math.cos((t * Math.PI) / 2) ** 0.8;
      pts.push([x, y]);
    }
    for (let t = 0; t <= 1; t += 0.02) {
      const y = -1 + t * 1.86;
      const x = -0.78 * Math.cos(((1 - t) * Math.PI) / 2) ** 0.8;
      pts.push([x, y]);
    }
    return pts.map(([x, y]) => [x * s, y * s] as [number, number]);
  };
  const trace = (pts: [number, number][], total: number, jitter: number) => {
    for (let k = 0; k < total; k++) {
      const i = Math.floor(r() * (pts.length - 1));
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];
      const t = r();
      put(
        ax + (bx - ax) * t + (r() - 0.5) * jitter,
        ay + (by - ay) * t + (r() - 0.5) * jitter,
        (r() - 0.5) * 0.08,
      );
    }
  };
  trace(outline(1), Math.floor(count * 0.38), 0.05);
  trace(outline(0.86), Math.floor(count * 0.14), 0.02);
  // padlock body
  const body: [number, number][] = [
    [-0.28, 0.05],
    [0.28, 0.05],
    [0.28, -0.45],
    [-0.28, -0.45],
    [-0.28, 0.05],
  ];
  trace(body, Math.floor(count * 0.2), 0.03);
  for (let k = 0; k < count * 0.08; k++)
    put(-0.24 + r() * 0.48, -0.41 + r() * 0.42, (r() - 0.5) * 0.05);
  // shackle
  for (let k = 0; k < count * 0.12; k++) {
    const a = r() * Math.PI;
    const rad = 0.19 + (r() - 0.5) * 0.05;
    put(Math.cos(a) * rad, 0.05 + Math.sin(a) * rad * 1.2, (r() - 0.5) * 0.06);
  }
  // keyhole
  for (let k = 0; k < count * 0.03; k++) {
    const a = r() * Math.PI * 2;
    put(Math.cos(a) * 0.05, -0.14 + Math.sin(a) * 0.05, 0.03);
  }
  return finish(out, n());
}

/** Loose star field for quiet sections. */
export function field(count: number): Shape {
  const out = new Float32Array(count * 3);
  const r = rng(6);
  for (let i = 0; i < count; i++) {
    out[i * 3] = (r() - 0.5) * 3.6;
    out[i * 3 + 1] = (r() - 0.5) * 2.2;
    out[i * 3 + 2] = (r() - 0.5) * 1.5;
  }
  return out;
}

/**
 * Portrait from a photo on a light background: darker pixels and edges get more points.
 * Falls back to a soft sphere if the image cannot be read.
 */
export async function portrait(count: number, src: string): Promise<Shape> {
  const out = new Float32Array(count * 3);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    await img.decode();
    const w = 160;
    const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++)
      lum[i] = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
    // Cumulative weights, so each sample is a binary search.
    const cumulative = new Float32Array(w * h);
    let total = 0;
    for (let i = 0; i < w * h; i++) {
      const x = i % w;
      const y = Math.floor(i / w);
      if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
        const edge = Math.abs(lum[i + 1] - lum[i - 1]) + Math.abs(lum[i + w] - lum[i - w]);
        const dark = Math.max(0, 0.93 - lum[i]);
        total += dark ** 1.3 + edge * 1.6;
      }
      cumulative[i] = total;
    }
    const r = rng(7);
    const scale = 2 / h;
    for (let p = 0; p < count; p++) {
      const target = r() * total;
      let lo = 0;
      let hi = cumulative.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cumulative[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      const i = lo;
      const x = (i % w) + r() - 0.5;
      const y = Math.floor(i / w) + r() - 0.5;
      out[p * 3] = (x - w / 2) * scale;
      out[p * 3 + 1] = -(y - h / 2) * scale;
      out[p * 3 + 2] = (0.5 - lum[i]) * 0.25 + (r() - 0.5) * 0.03;
    }
    return out;
  } catch {
    return globe(count);
  }
}
