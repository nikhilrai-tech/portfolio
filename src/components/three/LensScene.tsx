"use client";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  CircleGeometry,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  MathUtils,
  Mesh,
  Object3D,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
} from "three";
import { apertureFromF, fNumber, scrollProgress } from "@/lib/fstop";
import { createIrisMaterial } from "./irisMaterial";
import type { Pointer } from "./LensCanvas";

const FOV = 35;
const CAM_Z = 7.5;
const LENS_RADIUS = 1.5;
const IRIS_RADIUS = 1.08;

type Props = {
  onReady: () => void;
  pointer: React.RefObject<Pointer>;
  slot: React.RefObject<HTMLElement | null>;
  maxDpr: number;
  active: boolean;
};

export default function LensScene({ onReady, pointer, slot, maxDpr, active }: Props) {
  return (
    <Canvas
      dpr={[1, maxDpr]}
      frameloop={active ? "demand" : "never"}
      camera={{ fov: FOV, position: [0, 0, CAM_Z] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => requestAnimationFrame(onReady)}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, -2, 2]} intensity={0.4} color="#63c7d9" />
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={3}
          position={[-4, 3, 4]}
          scale={[6, 2, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="ring"
          intensity={2.2}
          color="#eba73f"
          position={[4, 2, 3]}
          scale={2.5}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#63c7d9"
          position={[2, -4, 2]}
          scale={[5, 1, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer form="circle" intensity={1.2} position={[0, 0, -6]} scale={6} />
      </Environment>
      <Invalidator />
      <Rig pointer={pointer} slot={slot}>
        <Lens />
      </Rig>
      <Flare pointer={pointer} />
    </Canvas>
  );
}

// Frames render on demand: on scroll, on pointer move, and while anything is still easing.
const EPS = 1e-4;
function settling(...pairs: [number, number][]) {
  return pairs.some(([a, b]) => Math.abs(a - b) > EPS);
}

function Invalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const kick = () => invalidate();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("pointermove", kick, { passive: true });
    window.addEventListener("resize", kick);
    kick();
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("pointermove", kick);
      window.removeEventListener("resize", kick);
    };
  }, [invalidate]);
  return null;
}

/** Places the lens over the #lens-slot box, follows scroll, tilts toward the pointer. */
function Rig({
  children,
  pointer,
  slot,
}: {
  children: React.ReactNode;
  pointer: Props["pointer"];
  slot: Props["slot"];
}) {
  const group = useRef<Group>(null);
  const { size } = useThree();
  const visibleH = 2 * CAM_Z * Math.tan(MathUtils.degToRad(FOV / 2));

  useFrame((state, delta) => {
    const g = group.current;
    const el = slot.current;
    if (!g || !el) return;
    const rect = el.getBoundingClientRect();
    const visibleW = visibleH * (size.width / size.height);
    const cx = ((rect.left + rect.width / 2) / size.width) * 2 - 1;
    const cy = -(((rect.top + rect.height / 2) / size.height) * 2 - 1);
    const scale = ((rect.height / size.height) * visibleH * 0.5) / LENS_RADIUS;

    // Delta is capped: with on-demand frames the first one after a pause can be very late.
    const dt = Math.min(delta, 1 / 30);
    const k = 1 - Math.exp(-dt * 10);
    const tx = (cx * visibleW) / 2;
    const ty = (cy * visibleH) / 2;
    g.position.x = MathUtils.lerp(g.position.x, tx, k);
    g.position.y = MathUtils.lerp(g.position.y, ty, k);
    g.scale.setScalar(MathUtils.lerp(g.scale.x, scale, k));

    const p = scrollProgress();
    const px = pointer.current?.x ?? 0;
    const py = pointer.current?.y ?? 0;
    const tk = 1 - Math.exp(-dt * 4);
    const ry = -0.42 + px * 0.3;
    const rx = 0.16 - py * 0.22 + p * 0.6;
    const rz = p * 0.5;
    g.rotation.y = MathUtils.lerp(g.rotation.y, ry, tk);
    g.rotation.x = MathUtils.lerp(g.rotation.x, rx, tk);
    g.rotation.z = MathUtils.lerp(g.rotation.z, rz, tk);

    if (
      settling(
        [g.position.x, tx],
        [g.position.y, ty],
        [g.scale.x, scale],
        [g.rotation.y, ry],
        [g.rotation.x, rx],
        [g.rotation.z, rz],
      )
    )
      state.invalidate();
  });

  return <group ref={group}>{children}</group>;
}

function Lens() {
  const iris = useMemo(() => createIrisMaterial(), []);
  const irisMesh = useRef<Mesh<CircleGeometry, ShaderMaterial>>(null);
  const focusRing = useRef<Group>(null);
  const aperture = useRef(apertureFromF(1.4));

  useFrame((state, delta) => {
    const p = scrollProgress();
    const target = apertureFromF(fNumber(p));
    aperture.current = MathUtils.damp(aperture.current, target, 6, Math.min(delta, 1 / 30));
    const u = irisMesh.current?.material.uniforms;
    if (u) {
      u.uAperture.value = aperture.current;
      u.uRot.value = (0.9 - aperture.current) * 1.6;
      u.uLight.value = p * 2.4 - 0.4;
    }
    if (focusRing.current) focusRing.current.rotation.z = p * Math.PI * 1.2;
    if (settling([aperture.current, target])) state.invalidate();
  });

  // Barrel parts are cylinders whose axis we turn toward the camera (z).
  const toZ: [number, number, number] = [Math.PI / 2, 0, 0];

  return (
    <group>
      {/* Mount and rear barrel */}
      <mesh rotation={toZ} position={[0, 0, -1.25]}>
        <cylinderGeometry args={[1.18, 1.22, 0.5, 96]} />
        <meshStandardMaterial color="#2b3038" metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh rotation={toZ} position={[0, 0, -1.55]}>
        <cylinderGeometry args={[1.05, 1.05, 0.14, 96]} />
        <meshStandardMaterial color="#9aa3ae" metalness={1} roughness={0.25} />
      </mesh>

      {/* Main barrel */}
      <mesh rotation={toZ} position={[0, 0, -0.55]}>
        <cylinderGeometry args={[1.38, 1.3, 0.95, 128]} />
        <meshStandardMaterial color="#14171c" metalness={0.55} roughness={0.55} />
      </mesh>

      {/* Focus ring with knurling */}
      <group ref={focusRing} position={[0, 0, 0.05]}>
        <mesh rotation={toZ}>
          <cylinderGeometry args={[1.46, 1.46, 0.42, 128, 1, true]} />
          <meshStandardMaterial color="#0d0f12" metalness={0.2} roughness={0.85} />
        </mesh>
        <Knurling count={120} radius={1.47} depth={0.38} />
      </group>

      {/* Amber accent ring */}
      <mesh position={[0, 0, 0.33]}>
        <torusGeometry args={[1.43, 0.022, 12, 160]} />
        <meshStandardMaterial
          color="#eba73f"
          emissive="#eba73f"
          emissiveIntensity={0.6}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Front bezel */}
      <mesh rotation={toZ} position={[0, 0, 0.45]}>
        <cylinderGeometry args={[1.5, 1.44, 0.2, 128, 1, true]} />
        <meshStandardMaterial color="#1b1f25" metalness={0.8} roughness={0.3} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.55]}>
        <ringGeometry args={[IRIS_RADIUS + 0.05, 1.5, 128]} />
        <meshStandardMaterial color="#20252c" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, 0.551]}>
        <ringGeometry args={[1.24, 1.26, 128]} />
        <meshBasicMaterial color="#3a414b" />
      </mesh>

      {/* Inner tube, seen past the bezel */}
      <mesh rotation={toZ} position={[0, 0, 0.35]}>
        <cylinderGeometry args={[IRIS_RADIUS + 0.05, IRIS_RADIUS + 0.05, 0.4, 96, 1, true]} />
        <meshStandardMaterial color="#07080a" roughness={0.9} side={BackSide} />
      </mesh>

      {/* Iris */}
      <mesh ref={irisMesh} position={[0, 0, 0.16]} material={iris}>
        <circleGeometry args={[IRIS_RADIUS + 0.05, 128]} />
      </mesh>

      {/* Front element: a thin coated dome */}
      <FrontGlass />
    </group>
  );
}

function Knurling({ count, radius, depth }: { count: number; radius: number; depth: number }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      o.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      o.rotation.set(0, 0, a);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, radius]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.03, 0.035, depth]} />
      <meshStandardMaterial color="#1c2026" metalness={0.3} roughness={0.7} />
    </instancedMesh>
  );
}

function FrontGlass() {
  const R = 2.3;
  const theta = Math.asin(IRIS_RADIUS / R);
  const rimY = R * Math.cos(theta);
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.5 - rimY]}>
      <sphereGeometry args={[R, 96, 24, 0, Math.PI * 2, 0, theta]} />
      <meshPhysicalMaterial
        color="#1a2230"
        roughness={0.04}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.02}
        iridescence={1}
        iridescenceIOR={1.6}
        iridescenceThicknessRange={[180, 520]}
        envMapIntensity={1.4}
        transparent
        opacity={0.12}
        depthWrite={false}
      />
    </mesh>
  );
}

function makeGlowTexture(inner: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, inner.replace(/[\d.]+\)$/, "0.35)"));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

/** A soft light that trails the cursor, with a ghost reflected through the screen centre. */
function Flare({ pointer }: { pointer: Props["pointer"] }) {
  const main = useRef<Sprite>(null);
  const ghost = useRef<Sprite>(null);
  const { viewport } = useThree();
  const [mainMat, ghostMat] = useMemo(
    () => [
      new SpriteMaterial({
        map: makeGlowTexture("rgba(255,214,150,1)"),
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      }),
      new SpriteMaterial({
        map: makeGlowTexture("rgba(99,199,217,1)"),
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.25,
        color: new Color("#ffffff"),
      }),
    ],
    [],
  );

  useFrame((state, delta) => {
    // Additive light only reads on a dark page.
    const set = document.documentElement.dataset.theme;
    const light = set
      ? set === "light"
      : window.matchMedia("(prefers-color-scheme: light)").matches;
    if (main.current) main.current.visible = !light;
    if (ghost.current) ghost.current.visible = !light;
    const px = pointer.current?.x ?? 0;
    const py = pointer.current?.y ?? 0;
    const k = 1 - Math.exp(-Math.min(delta, 1 / 30) * 8);
    const tx = (px * viewport.width) / 2;
    const ty = (py * viewport.height) / 2;
    if (main.current) {
      main.current.position.x = MathUtils.lerp(main.current.position.x, tx, k);
      main.current.position.y = MathUtils.lerp(main.current.position.y, ty, k);
    }
    if (ghost.current) {
      ghost.current.position.x = MathUtils.lerp(ghost.current.position.x, -tx * 0.45, k);
      ghost.current.position.y = MathUtils.lerp(ghost.current.position.y, -ty * 0.45, k);
    }
    if (main.current && settling([main.current.position.x, tx], [main.current.position.y, ty]))
      state.invalidate();
  });

  return (
    <>
      <sprite ref={main} material={mainMat} position={[0, 0, 1.2]} scale={1.1} />
      <sprite ref={ghost} material={ghostMat} position={[0, 0, 1.2]} scale={0.55} />
    </>
  );
}
