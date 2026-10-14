"use client";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as THREE from "three";
import type { Lighting, PlanObject, Project } from "@/lib/types";
import { localPoly } from "@/lib/geometry";
import { SPECIES, matById } from "@/lib/catalog";
import { TILE_M, makeCanvas } from "@/lib/textures";
import type { ViewPreset } from "@/lib/store";

const rad = (d: number) => (d * Math.PI) / 180;
const hash = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };

const PRESETS: Record<Lighting, { bg: string; sun: [number, number, number]; sunColor: string; sunI: number; sky: string; ground: string; hemiI: number; lamp: number; ground2: string; env: number }> = {
  day: { bg: "#e6edf0", sun: [22, 30, 14], sunColor: "#fff6e6", sunI: 2.6, sky: "#e9f0f5", ground: "#9aa58a", hemiI: 0.55, lamp: 0.0, ground2: "#dfe2d6", env: 0.55 },
  golden: { bg: "#f0d8be", sun: [-30, 11, 18], sunColor: "#ffb26e", sunI: 3.0, sky: "#ffe2c4", ground: "#8a7d62", hemiI: 0.35, lamp: 1.0, ground2: "#d9d2bd", env: 0.3 },
  evening: { bg: "#18233a", sun: [-12, 16, -16], sunColor: "#8aa3d8", sunI: 0.5, sky: "#2b3d63", ground: "#1b2418", hemiI: 0.3, lamp: 2.6, ground2: "#2a3326", env: 0.12 },
};

const texCache = new Map<string, THREE.CanvasTexture>();
function getTex(matId: string, pattern?: string) {
  const key = `${matId}|${pattern}`;
  let t = texCache.get(key);
  if (!t) {
    t = new THREE.CanvasTexture(makeCanvas(matId, pattern as never));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / TILE_M, -1 / TILE_M);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    texCache.set(key, t);
  }
  return t;
}

const ICO = new THREE.IcosahedronGeometry(1, 3);
const CONE = new THREE.ConeGeometry(1, 1, 24);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 24);
const BLADE = new THREE.ConeGeometry(1, 1, 4).translate(0, 0.5, 0);
const ROT_Y = (o: PlanObject) => [0, -rad(o.rot), 0] as [number, number, number];

function Shaped({ o, idx, lit }: { o: PlanObject; idx: number; lit: boolean }) {
  const depth = o.kind === "surface" ? 0.07 : o.kind === "bed" ? 0.1 : 0.04;
  const m = matById(o.material);
  const pattern = m.tex === "bricks" ? o.pattern ?? m.pattern : undefined;
  const geo = useMemo(() => {
    const shape = new THREE.Shape(localPoly(o).map(([x, y]) => new THREE.Vector2(x, -y)));
    return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  }, [o.poly, o.w, o.h, depth]); // eslint-disable-line react-hooks/exhaustive-deps
  const tex = getTex(m.id, pattern);
  const edge = o.kind === "surface" ? o.edging ?? "none" : "none";
  const line = useMemo(() => {
    const p = localPoly(o).map(([x, y]) => new THREE.Vector3(x, depth + 0.006, y));
    return new THREE.BufferGeometry().setFromPoints(p);
  }, [o.poly, o.w, o.h, depth]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group position={[o.x, idx * 0.0004, o.y]} rotation={ROT_Y(o)}>
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow={o.kind === "bed"}>
        <meshStandardMaterial attach="material-0" map={tex} roughness={o.kind === "lawn" ? 1 : 0.85} />
        <meshStandardMaterial attach="material-1" color={new THREE.Color(m.color).multiplyScalar(0.55)} roughness={1} />
      </mesh>
      {edge !== "none" && (
        <lineLoop geometry={line}><lineBasicMaterial color={edge === "graphite" ? "#1b1e20" : "#e8e5dc"} /></lineLoop>
      )}
      {lit && o.kind === "surface" && null}
    </group>
  );
}

const FACADE = { white: "#ece8df", graphite: "#3d4246", wood: "#8c6747" } as const;
function Glass({ w, h, x, y, z, ry = 0, lit }: { w: number; h: number; x: number; y: number; z: number; ry?: number; lit: number }) {
  return (
    <mesh position={[x, y, z]} rotation={[0, ry, 0]}>
      <boxGeometry args={[w, h, 0.06]} />
      <meshStandardMaterial color="#1e2a33" metalness={0.7} roughness={0.12} emissive="#ffc67a" emissiveIntensity={lit * 0.9} />
      <mesh position={[0, 0, -0.015]}><boxGeometry args={[w + 0.12, h + 0.12, 0.03]} /><meshStandardMaterial color="#25292b" roughness={0.5} /></mesh>
    </mesh>
  );
}
function House({ o, lit }: { o: PlanObject; lit: number }) {
  const H = o.height ?? 6, w = o.w, d = o.h;
  const body = FACADE[o.facade ?? "white"];
  return (
    <group position={[o.x, 0, o.y]} rotation={ROT_Y(o)}>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow><boxGeometry args={[w, H, d]} /><meshStandardMaterial color={body} roughness={0.9} /></mesh>
      <mesh position={[0, H + 0.13, 0]} castShadow><boxGeometry args={[w + 0.5, 0.26, d + 0.5]} /><meshStandardMaterial color="#2a2d2f" roughness={0.7} /></mesh>
      <mesh position={[-w * 0.18, H + 0.26 + 1.35, 0]} castShadow><boxGeometry args={[w * 0.5, 2.7, d * 0.66]} /><meshStandardMaterial color={o.facade === "wood" ? FACADE.white : FACADE.wood} roughness={0.85} /></mesh>
      <mesh position={[-w * 0.18, H + 2.75, 0]}><boxGeometry args={[w * 0.5 + 0.4, 0.2, d * 0.66 + 0.4]} /><meshStandardMaterial color="#2a2d2f" /></mesh>
      {/* front (+z) */}
      <Glass w={w * 0.34} h={2.3} x={w * 0.2} y={1.5} z={d / 2 + 0.02} lit={lit} />
      <Glass w={1.5} h={1.5} x={-w * 0.35} y={4.1} z={d / 2 + 0.02} lit={lit} />
      <Glass w={1.5} h={1.5} x={-w * 0.05} y={4.1} z={d / 2 + 0.02} lit={lit} />
      <Glass w={1.5} h={1.5} x={w * 0.25} y={4.1} z={d / 2 + 0.02} lit={lit} />
      <mesh position={[-w * 0.2, 1.15, d / 2 + 0.03]}><boxGeometry args={[1.15, 2.3, 0.08]} /><meshStandardMaterial color="#5a3d28" roughness={0.7} /></mesh>
      <mesh position={[-w * 0.2, 2.6, d / 2 + 0.5]} castShadow><boxGeometry args={[2.2, 0.12, 1.1]} /><meshStandardMaterial color="#2a2d2f" /></mesh>
      {/* back (-z) */}
      <Glass w={w * 0.5} h={2.5} x={0} y={1.4} z={-d / 2 - 0.02} lit={lit} />
      <Glass w={w * 0.5} h={1.6} x={0} y={4.1} z={-d / 2 - 0.02} lit={lit} />
    </group>
  );
}
function Garage({ o, lit }: { o: PlanObject; lit: number }) {
  const H = o.height ?? 3;
  const big = o.w > 4.2;
  return (
    <group position={[o.x, 0, o.y]} rotation={ROT_Y(o)}>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow><boxGeometry args={[o.w, H, o.h]} /><meshStandardMaterial color={FACADE[o.facade ?? "white"]} roughness={0.9} /></mesh>
      <mesh position={[0, H + 0.1, 0]} castShadow><boxGeometry args={[o.w + 0.4, 0.2, o.h + 0.4]} /><meshStandardMaterial color="#2a2d2f" /></mesh>
      {big && <>
        <mesh position={[0, 1.15, o.h / 2 + 0.03]}><boxGeometry args={[o.w * 0.78, 2.3, 0.06]} /><meshStandardMaterial color="#44494c" roughness={0.6} /></mesh>
        {[0.45, 0.9, 1.35, 1.8].map((y) => <mesh key={y} position={[0, y, o.h / 2 + 0.07]}><boxGeometry args={[o.w * 0.78, 0.03, 0.02]} /><meshStandardMaterial color="#202325" /></mesh>)}
        <mesh position={[0, 2.6, o.h / 2 + 0.05]}><boxGeometry args={[o.w * 0.7, 0.06, 0.04]} /><meshStandardMaterial color="#fff0c8" emissive="#ffd9a0" emissiveIntensity={lit * 1.5} /></mesh>
      </>}
    </group>
  );
}

function Tree({ o, lit }: { o: PlanObject; lit: boolean }) {
  const sp = SPECIES[o.species ?? "klon"];
  const f = o.w / sp.d, H = sp.height * f, r = o.w / 2;
  const seed = o.x * 13 + o.y * 7;
  const dark = lit ? 0.75 : 1;
  const mat = (c: string) => <meshStandardMaterial color={c} roughness={0.9} />;
  const trunk = (h: number, rr: number, c = "#5a4330") => <mesh geometry={CYL} position={[0, h / 2, 0]} scale={[rr, h, rr]} castShadow><meshStandardMaterial color={c} roughness={1} /></mesh>;
  void dark;
  if (sp.style === "cone") {
    return (
      <group position={[o.x, 0, o.y]}>
        {trunk(H * 0.2, 0.12 * f + 0.05)}
        {[0, 1, 2].map((i) => <mesh key={i} geometry={CONE} position={[0, H * (0.2 + i * 0.25) + H * 0.2, 0]} scale={[r * (1 - i * 0.25), H * 0.45, r * (1 - i * 0.25)]} castShadow>{mat(i % 2 ? sp.color : "#245640")}</mesh>)}
      </group>
    );
  }
  if (sp.style === "column") {
    return <group position={[o.x, 0, o.y]}><mesh geometry={CONE} position={[0, H / 2, 0]} scale={[r, H, r]} castShadow>{mat(sp.color)}</mesh></group>;
  }
  if (sp.style === "bush") {
    return (
      <group position={[o.x, 0, o.y]}>
        <mesh geometry={ICO} position={[0, H * 0.45, 0]} scale={[r, H * 0.5, r]} castShadow>{mat(sp.color)}</mesh>
        {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * 6.28 + seed; const rr = r * (0.45 + hash(i, seed) * 0.3); return <mesh key={i} geometry={ICO} position={[Math.cos(a) * rr, H * (0.55 + hash(i, 3) * 0.35), Math.sin(a) * rr]} scale={r * 0.3}>{mat(sp.accent ?? sp.color)}</mesh>; })}
      </group>
    );
  }
  const th = H * (sp.style === "birch" ? 0.5 : 0.36);
  const canopyH = H - th;
  const light = sp.style === "birch";
  return (
    <group position={[o.x, 0, o.y]}>
      {trunk(th + canopyH * 0.2, (sp.style === "birch" ? 0.07 : 0.11) * Math.max(f, 0.8) + 0.04, light ? "#e5e3dc" : "#5a4330")}
      <mesh geometry={ICO} position={[0, th + canopyH * 0.5, 0]} scale={[r * (light ? 0.7 : 0.85), canopyH * 0.5, r * (light ? 0.7 : 0.85)]} castShadow>{mat(sp.color)}</mesh>
      {Array.from({ length: light ? 7 : 10 }, (_, i) => {
        const a = (i / 7) * 6.28 * 1.1 + seed;
        const rr = r * (light ? 0.3 : 0.5);
        return <mesh key={i} geometry={ICO} position={[Math.cos(a) * rr, th + canopyH * (0.25 + hash(i, seed) * 0.55), Math.sin(a) * rr]} scale={[r * 0.45, canopyH * 0.26, r * 0.45]} castShadow>{mat(i % 3 === 0 && sp.accent && !light ? "#6d8a3a" : sp.color)}</mesh>;
      })}
    </group>
  );
}

function Hedge({ o }: { o: PlanObject }) {
  const sp = SPECIES.zywoplot;
  return (
    <group position={[o.x, 0, o.y]} rotation={ROT_Y(o)}>
      <mesh position={[0, sp.height / 2, 0]} castShadow receiveShadow><boxGeometry args={[o.w, sp.height, o.h]} /><meshStandardMaterial color={sp.color} roughness={1} /></mesh>
      {Array.from({ length: Math.round(Math.max(o.w, o.h) / 0.8) }, (_, i) => { const t = ((i + 0.5) / Math.round(Math.max(o.w, o.h) / 0.8) - 0.5) * Math.max(o.w, o.h); return <mesh key={i} geometry={ICO} position={o.h > o.w ? [0, sp.height, t] : [t, sp.height, 0]} scale={[Math.min(o.w, o.h) * 0.5, 0.3, Math.min(o.w, o.h) * 0.5]}><meshStandardMaterial color="#336b45" /></mesh>; })}
    </group>
  );
}

function GrassTufts({ items }: { items: PlanObject[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const per = 22;
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    const d = new THREE.Object3D(), c = new THREE.Color();
    const sp = SPECIES.trawy;
    let n = 0;
    items.forEach((o, k) => {
      for (let i = 0; i < per; i++) {
        const a = hash(k, i) * 6.283, rr = Math.sqrt(hash(i, k + 5)) * o.w * 0.45;
        d.position.set(o.x + Math.cos(a) * rr, 0, o.y + Math.sin(a) * rr);
        const tilt = (rr / (o.w * 0.45)) * 0.5;
        d.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt);
        const hh = (0.55 + hash(i, k) * 0.7) * sp.height * (o.w / sp.d);
        d.scale.set(0.035, hh, 0.035);
        d.updateMatrix(); m.setMatrixAt(n, d.matrix);
        c.set(hash(i, k + 9) > 0.5 ? sp.color : sp.accent!); m.setColorAt(n, c); n++;
      }
    });
    m.count = n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  if (!items.length) return null;
  return <instancedMesh key={items.length} ref={ref} args={[BLADE, undefined, items.length * per]} castShadow><meshStandardMaterial roughness={0.9} /></instancedMesh>;
}

function Pergola({ o }: { o: PlanObject }) {
  const hgt = 2.6, c = "#2b2f31";
  return (
    <group position={[o.x, 0, o.y]} rotation={ROT_Y(o)}>
      {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([a, b], i) => <mesh key={i} position={[(a * (o.w - 0.2)) / 2, hgt / 2, (b * (o.h - 0.2)) / 2]} castShadow><boxGeometry args={[0.18, hgt, 0.18]} /><meshStandardMaterial color={c} /></mesh>)}
      {[-1, 1].map((b) => <mesh key={b} position={[0, hgt + 0.08, (b * (o.h - 0.2)) / 2]} castShadow><boxGeometry args={[o.w, 0.16, 0.16]} /><meshStandardMaterial color={c} /></mesh>)}
      {Array.from({ length: Math.floor(o.w / 0.4) }, (_, i) => <mesh key={i} position={[-o.w / 2 + 0.3 + i * 0.4, hgt + 0.2, 0]} castShadow><boxGeometry args={[0.08, 0.1, o.h]} /><meshStandardMaterial color="#6a533e" /></mesh>)}
    </group>
  );
}

function Misc({ o, lamp, lampLight }: { o: PlanObject; lamp: number; lampLight: boolean }) {
  const pos: [number, number, number] = [o.x, 0, o.y];
  switch (o.kind) {
    case "bench":
      return (
        <group position={pos} rotation={ROT_Y(o)}>
          <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[o.w, 0.06, o.h]} /><meshStandardMaterial color="#8a6a4a" /></mesh>
          <mesh position={[0, 0.75, -o.h / 2 + 0.03]} castShadow><boxGeometry args={[o.w, 0.4, 0.05]} /><meshStandardMaterial color="#8a6a4a" /></mesh>
          {[-1, 1].map((s) => <mesh key={s} position={[s * (o.w / 2 - 0.1), 0.22, 0]}><boxGeometry args={[0.06, 0.44, o.h * 0.9]} /><meshStandardMaterial color="#25282a" /></mesh>)}
        </group>
      );
    case "planter":
      return (
        <group position={pos} rotation={ROT_Y(o)}>
          <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[o.w, 0.6, o.w]} /><meshStandardMaterial color="#3e4244" roughness={0.6} /></mesh>
          <mesh geometry={ICO} position={[0, 0.75, 0]} scale={[o.w * 0.42, 0.35, o.w * 0.42]} castShadow><meshStandardMaterial color="#5f8f45" /></mesh>
        </group>
      );
    case "water":
      return (
        <group position={pos} rotation={ROT_Y(o)}>
          <mesh geometry={CYL} position={[0, 0.07, 0]} scale={[o.w / 2 + 0.22, 0.14, o.h / 2 + 0.22]} receiveShadow castShadow><meshStandardMaterial color="#8e908a" roughness={0.9} /></mesh>
          <mesh geometry={CYL} position={[0, 0.125, 0]} scale={[o.w / 2, 0.02, o.h / 2]}><meshStandardMaterial color="#3d89ad" metalness={0.5} roughness={0.05} /></mesh>
        </group>
      );
    case "fence":
      return <mesh position={[o.x, 0.6, o.y]} rotation={ROT_Y(o)} castShadow><boxGeometry args={[o.w, 1.2, Math.max(o.h, 0.08)]} /><meshStandardMaterial color="#24282a" roughness={0.6} /></mesh>;
    case "gate":
      return (
        <group position={pos} rotation={ROT_Y(o)}>
          {[-1, 1].map((s) => <mesh key={s} position={[(s * o.w) / 2, 0.85, 0]} castShadow><boxGeometry args={[0.22, 1.7, 0.22]} /><meshStandardMaterial color="#1f2325" /></mesh>)}
        </group>
      );
    case "light":
      return (
        <group position={pos}>
          <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.025, 0.03, 0.7, 6]} /><meshStandardMaterial color="#26292b" /></mesh>
          <mesh position={[0, 0.76, 0]}><sphereGeometry args={[0.1, 10, 8]} /><meshStandardMaterial color="#fff2d0" emissive="#ffc877" emissiveIntensity={0.2 + lamp * 2.2} toneMapped={false} /></mesh>
          {lampLight && <pointLight position={[0, 0.9, 0]} color="#ffc877" intensity={lamp * 5} distance={7} decay={2} />}
        </group>
      );
    default: return null;
  }
}

function edgeIntervals(len: number, gates: { c: number; hw: number }[]) {
  let segs: [number, number][] = [[0, len]];
  for (const g of gates) segs = segs.flatMap(([a, b]) => { const lo = g.c - g.hw, hi = g.c + g.hw; if (hi <= a || lo >= b) return [[a, b]] as [number, number][]; const r: [number, number][] = []; if (lo > a) r.push([a, lo]); if (hi < b) r.push([hi, b]); return r; });
  return segs.filter(([a, b]) => b - a > 0.05);
}
function BoundaryFence({ project }: { project: Project }) {
  const { w: W, l: L } = project.plot;
  const col = project.fence.style === "wood" ? "#7d5c3d" : project.fence.style === "light" ? "#d8d5ca" : "#23272a";
  const gates = project.objects.filter((o) => o.kind === "gate");
  const edges: { x: number; y: number; len: number; horiz: boolean }[] = [
    { x: 0, y: 0, len: W, horiz: true }, { x: 0, y: L, len: W, horiz: true }, { x: 0, y: 0, len: L, horiz: false }, { x: W, y: 0, len: L, horiz: false },
  ];
  return (
    <group>
      {edges.flatMap((e, k) => {
        const gs = gates.filter((g) => (e.horiz ? Math.abs(g.y - e.y) < 0.8 : Math.abs(g.x - e.x) < 0.8)).map((g) => ({ c: e.horiz ? g.x : g.y, hw: g.w / 2 }));
        return edgeIntervals(e.len, gs).flatMap(([a, b], j) => {
          const len = b - a, mid = (a + b) / 2;
          const cx = e.horiz ? mid : e.x, cz = e.horiz ? e.y : mid;
          const posts = Math.max(1, Math.round(len / 2.5));
          return [
            <mesh key={`${k}-${j}`} position={[cx, 0.65, cz]} castShadow><boxGeometry args={e.horiz ? [len, 1.1, 0.05] : [0.05, 1.1, len]} /><meshStandardMaterial color={col} roughness={0.55} metalness={project.fence.style === "graphite" ? 0.3 : 0} /></mesh>,
            ...Array.from({ length: posts + 1 }, (_, i) => { const t = a + (len * i) / posts; return <mesh key={`${k}-${j}-p${i}`} position={[e.horiz ? t : e.x, 0.67, e.horiz ? e.y : t]} castShadow><boxGeometry args={[0.1, 1.34, 0.1]} /><meshStandardMaterial color={col} /></mesh>; }),
          ];
        });
      })}
    </group>
  );
}

function Neighbours({ project, col }: { project: Project; col: string }) {
  const { w: W, l: L } = project.plot;
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (W / 2 + 9), 0, L * 0.05]}>
          <mesh position={[0, 3, 0]} castShadow receiveShadow><boxGeometry args={[9, 6, 8]} /><meshStandardMaterial color={col} /></mesh>
          <mesh position={[0, 6.15, 0]}><boxGeometry args={[9.6, 0.3, 8.6]} /><meshStandardMaterial color="#3a3d40" /></mesh>
        </group>
      ))}
    </group>
  );
}

function Atmosphere({ lighting, quality }: { lighting: Lighting; quality: "high" | "low" }) {
  const P = PRESETS[lighting];
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const { scene, gl } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => { scene.environment = null; env.dispose(); pm.dispose(); };
  }, [gl, scene]);
  useEffect(() => { scene.environmentIntensity = P.env; }, [scene, P.env]);
  const tgt = useMemo(() => ({ bg: new THREE.Color(P.bg), sun: new THREE.Color(P.sunColor), sky: new THREE.Color(P.sky), gr: new THREE.Color(P.ground), pos: new THREE.Vector3(...P.sun) }), [P]);
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 3);
    (scene.background as THREE.Color).lerp(tgt.bg, k);
    (scene.fog as THREE.Fog).color.lerp(tgt.bg, k);
    if (sun.current) { sun.current.color.lerp(tgt.sun, k); sun.current.intensity += (P.sunI - sun.current.intensity) * k; sun.current.position.lerp(tgt.pos, k); }
    if (hemi.current) { hemi.current.color.lerp(tgt.sky, k); hemi.current.groundColor.lerp(tgt.gr, k); hemi.current.intensity += (P.hemiI - hemi.current.intensity) * k; }
  });
  return (
    <>
      <color attach="background" args={[P.bg]} />
      <fog attach="fog" args={[P.bg, 70, 230]} />
      <hemisphereLight ref={hemi} args={[P.sky, P.ground, P.hemiI]} />
      <directionalLight ref={sun} position={P.sun} intensity={P.sunI} color={P.sunColor} castShadow={quality === "high"} shadow-mapSize={[2048, 2048]} shadow-camera-left={-34} shadow-camera-right={34} shadow-camera-top={34} shadow-camera-bottom={-34} shadow-camera-near={1} shadow-camera-far={140} shadow-bias={-0.0004} shadow-normalBias={0.04} />
    </>
  );
}

function Rig({ view, nonce, plot, reduced }: { view: ViewPreset; nonce: number; plot: { w: number; l: number }; reduced: boolean }) {
  const { camera, controls } = useThree();
  const anim = useRef<{ t: number; fp: THREE.Vector3; tp: THREE.Vector3; ft: THREE.Vector3; tt: THREE.Vector3 } | null>(null);
  useEffect(() => {
    const c = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (!c) return;
    const m = Math.max(plot.w, plot.l);
    const to = view === "top" ? new THREE.Vector3(0, m * 1.45 + 6, 0.01) : view === "eye" ? new THREE.Vector3(-plot.w * 0.28, 1.7, plot.l / 2 - 2.5) : new THREE.Vector3(m * 0.7, m * 0.8, m * 0.95);
    const tt = view === "eye" ? new THREE.Vector3(0, 2.2, 0) : new THREE.Vector3(0, 0, 0);
    if (reduced) { camera.position.copy(to); c.target.copy(tt); c.update(); return; }
    anim.current = { t: 0, fp: camera.position.clone(), tp: to, ft: c.target.clone(), tt };
  }, [view, nonce, plot.w, plot.l]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, dt) => {
    const a = anim.current; const c = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (!a || !c) return;
    a.t = Math.min(1, a.t + dt / 1.0);
    const e = 1 - Math.pow(1 - a.t, 3);
    camera.position.lerpVectors(a.fp, a.tp, e); c.target.lerpVectors(a.ft, a.tt, e); c.update();
    if (a.t >= 1) anim.current = null;
  });
  return null;
}

function Capture({ fn }: { fn: React.MutableRefObject<(() => string) | null> }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => { fn.current = () => { gl.render(scene, camera); return gl.domElement.toDataURL("image/png"); }; return () => { fn.current = null; }; }, [gl, scene, camera, fn]);
  return null;
}

function World({ project, quality }: { project: Project; quality: "high" | "low" }) {
  const { w: W, l: L } = project.plot;
  const P = PRESETS[project.lighting];
  const lampK = P.lamp;
  const objs = project.objects;
  const grass = useMemo(() => objs.filter((o) => o.kind === "grass"), [objs]);
  let lampCount = 0;
  return (
    <group position={[-W / 2, 0, -L / 2]}>
      <group position={[W / 2, 0, L / 2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow><planeGeometry args={[600, 600]} /><meshStandardMaterial color={P.ground2} roughness={1} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, L / 2 + 5.8]} receiveShadow><planeGeometry args={[600, 7]} /><meshStandardMaterial color="#2c2f30" roughness={0.95} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, L / 2 + 1]} receiveShadow><planeGeometry args={[600, 1.8]} /><meshStandardMaterial color="#a2a49e" roughness={0.9} /></mesh>
        <Neighbours project={project} col={project.lighting === "evening" ? "#c8c8c2" : "#e4e1d8"} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0.003, L / 2]} receiveShadow><planeGeometry args={[W, L]} /><meshStandardMaterial color="#cdc6b3" roughness={1} /></mesh>
      {objs.map((o, i) => {
        const lit = lampK * 0.7 + 0.15;
        switch (o.kind) {
          case "surface": case "lawn": case "bed": return <Shaped key={o.id} o={o} idx={i} lit={lampK > 0} />;
          case "house": return <House key={o.id} o={o} lit={lampK > 1 ? 1 : lampK > 0 ? 0.35 : 0} />;
          case "garage": return <Garage key={o.id} o={o} lit={lampK > 1 ? 1 : lampK > 0 ? 0.35 : 0} />;
          case "tree": case "shrub": return <Tree key={o.id} o={o} lit={lit > 1} />;
          case "hedge": return <Hedge key={o.id} o={o} />;
          case "pergola": return <Pergola key={o.id} o={o} />;
          case "light": { const withLight = quality === "high" && lampK > 0 && lampCount++ < 7; return <Misc key={o.id} o={o} lamp={lampK} lampLight={withLight} />; }
          case "grass": return null;
          default: return <Misc key={o.id} o={o} lamp={lampK} lampLight={false} />;
        }
      })}
      <GrassTufts items={grass} />
      {project.fence.enabled && <BoundaryFence project={project} />}
    </group>
  );
}

export interface Scene3DProps {
  project: Project; view: ViewPreset; nonce: number; quality: "high" | "low"; visible?: boolean;
  captureRef?: React.MutableRefObject<(() => string) | null>;
  autoRotate?: boolean; lockZoom?: boolean;
}
export default function Scene3D({ project, view, nonce, quality, visible = true, captureRef, autoRotate, lockZoom }: Scene3DProps) {
  const fallback = useRef<(() => string) | null>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const m = Math.max(project.plot.w, project.plot.l);
  return (
    <Canvas shadows={quality === "high"} dpr={quality === "high" ? [1, 2] : 1} frameloop={visible ? "always" : "never"} camera={{ fov: 38, near: 0.1, far: 700, position: [m * 0.7, m * 0.8, m * 0.95] }} gl={{ antialias: quality === "high" }}>
      <Atmosphere lighting={project.lighting} quality={quality} />
      <World project={project} quality={quality} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2 - 0.02} minDistance={2} maxDistance={160} enableZoom={!lockZoom} autoRotate={autoRotate} autoRotateSpeed={0.5} />
      {quality === "high" && (
        <EffectComposer multisampling={4}>
          <N8AO aoRadius={1.6} distanceFalloff={1} intensity={2.4} color="black" quality="medium" />
        </EffectComposer>
      )}
      <Rig view={view} nonce={nonce} plot={project.plot} reduced={!!reduced} />
      <Capture fn={captureRef ?? fallback} />
    </Canvas>
  );
}
