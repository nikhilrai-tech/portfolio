import { Color, ShaderMaterial } from "three";

// Nine-blade iris on a flat disc. Inside the aperture we draw deep glass with a faint
// sensor glint; outside it, curved blades with seams and a moving specular sweep.
export function createIrisMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uAperture: { value: 0.9 },
      uRot: { value: 0 },
      uAccent: { value: new Color("#eba73f") },
      uCool: { value: new Color("#63c7d9") },
      uLight: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uAperture;
      uniform float uRot;
      uniform vec3 uAccent;
      uniform vec3 uCool;
      uniform float uLight;
      varying vec2 vUv;

      const float TAU = 6.28318530718;
      const float N = 9.0;

      float hash(float n) { return fract(sin(n * 91.345) * 47453.5453); }

      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p);
        float a = atan(p.y, p.x) + uRot;
        float seg = TAU / N;

        // Distance to the edge of a regular nonagon with circumradius uAperture.
        float k = mod(a, seg) - seg * 0.5;
        float polyR = uAperture * cos(seg * 0.5) / cos(k);
        float aa = fwidth(r) * 1.5;
        float inside = 1.0 - smoothstep(polyR - aa, polyR + aa, r);

        // Blades: curved seams that twist outward.
        float spiral = mod(a + r * 2.4 - uRot * 0.6, TAU);
        float id = floor(spiral / seg);
        float f = fract(spiral / seg);
        float seam = smoothstep(0.0, 0.04, f) * smoothstep(1.0, 0.94, f);
        vec3 blade = vec3(0.085, 0.092, 0.105) + 0.03 * hash(id);
        float sweep = pow(max(0.0, cos(a - 0.9 + uLight)), 6.0) * 0.32;
        blade = blade * mix(0.45, 1.0, seam) + sweep * (0.4 + 0.6 * f);
        blade *= mix(0.55, 1.0, smoothstep(1.0, 0.7, r));

        // Deep glass seen through the aperture.
        float depth = smoothstep(polyR, 0.0, r);
        vec3 deep = mix(vec3(0.02, 0.03, 0.05), uCool * 0.45, depth * 0.7);
        deep += uCool * 0.35 * exp(-pow(length(p - vec2(0.16, -0.1) * uAperture) * (7.0 / max(uAperture, 0.15)), 2.0));
        deep += vec3(0.35, 0.16, 0.6) * 0.22 * depth;

        vec3 col = mix(blade, deep, inside);
        // Thin warm edge where the blades meet the opening.
        float edge = smoothstep(polyR - 0.008, polyR, r) * (1.0 - smoothstep(polyR, polyR + 0.008, r));
        col += uAccent * 0.35 * edge;

        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
