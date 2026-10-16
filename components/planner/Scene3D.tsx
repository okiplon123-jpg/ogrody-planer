"use client";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
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
  day: { bg: "#e6edf0", sun: [22, 30, 14], sunColor: "#fff6e6", sunI: 2.1, sky: "#e9f0f5", ground: "#9aa58a", hemiI: 0.5, lamp: 0.0, ground2: "#aab397", env: 0.5 },
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
const FLORET = new THREE.IcosahedronGeometry(1, 1);
/** curved, tapering grass blade: unit height, base width 1 (scaled per instance) */
const BLADE = (() => {
  const seg = 6, pos: number[] = [], idx: number[] = [], nor: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg, w = 0.5 * (1 - t * 0.92), bend = 0.45 * t * t;
    pos.push(-w, t, bend, w, t, bend); nor.push(0, 0.2, 1, 0, 0.2, 1);
    if (i < seg) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
})();
const ROT_Y = (o: PlanObject) => [0, -rad(o.rot), 0] as [number, number, number];

function PhotoTop({ dir, tileM }: { dir: string; tileM: number }) {
  const [map, nor, rough] = useTexture([`/textures/${dir}/${dir}_diff_1k.jpg`, `/textures/${dir}/${dir}_nor_gl_1k.jpg`, `/textures/${dir}/${dir}_rough_1k.jpg`]);
  useLayoutEffect(() => {
    [map, nor, rough].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / tileM, -1 / tileM); t.anisotropy = 8; t.needsUpdate = true; });
    map.colorSpace = THREE.SRGBColorSpace;
  }, [map, nor, rough, tileM]);
  return <meshStandardMaterial attach="material-0" map={map} normalMap={nor} roughnessMap={rough} />;
}

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
        {m.photo ? <PhotoTop dir={m.photo.dir} tileM={m.photo.tileM} /> : <meshStandardMaterial attach="material-0" map={tex} roughness={o.kind === "lawn" ? 1 : 0.85} />}
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

const PLANT_MODEL: Record<string, string> = { klon: "tree_small_02", brzoza: "tree_small_02", swierk: "fir_tree_01" };
/** Real scanned plant (Poly Haven CC0), decimated for the web. Scaled to the species height * size factor. */
function ModelPlant({ o, file }: { o: PlanObject; file: string }) {
  const sp = SPECIES[o.species ?? "klon"];
  const { scene } = useGLTF(`/models/${file}.glb`);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    const b = new THREE.Box3().setFromObject(c), size = b.getSize(new THREE.Vector3());
    const H = sp.height * (o.w / sp.d);
    c.scale.setScalar(H / Math.max(size.y, 0.001));
    const b2 = new THREE.Box3().setFromObject(c);
    c.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -(b2.min.z + b2.max.z) / 2);
    const g = new THREE.Group(); g.add(c);
    g.traverse((n) => { const m = n as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; const mat = m.material as THREE.MeshStandardMaterial; if (mat.alphaTest === 0 && mat.transparent) mat.alphaTest = 0.4; } });
    g.rotation.y = (o.x * 37 + o.y * 17) % 6.28;
    return g;
  }, [scene, o.w, sp.height, sp.d, o.x, o.y]); // eslint-disable-line react-hooks/exhaustive-deps
  return <group position={[o.x, 0, o.y]}><primitive object={obj} /></group>;
}

function Tree({ o, lit }: { o: PlanObject; lit: boolean }) {
  const modelFile = o.species ? PLANT_MODEL[o.species] : undefined;
  if (modelFile) return <ModelPlant o={o} file={modelFile} />;
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
  if (sp.style === "bush") return <Bush o={o} />;
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
  const per = 90;
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    const d = new THREE.Object3D(), c = new THREE.Color();
    const sp = SPECIES.trawy;
    let n = 0;
    items.forEach((o, k) => {
      const f = o.w / sp.d;
      for (let i = 0; i < per; i++) {
        const a = hash(k + 3, i) * 6.283, rr = Math.pow(hash(i, k + 5), 0.7) * o.w * 0.42;
        d.position.set(o.x + Math.cos(a) * rr, 0, o.y + Math.sin(a) * rr);
        const out = 0.15 + (rr / (o.w * 0.42)) * 0.75;
        d.rotation.set(0, a + Math.PI / 2 + (hash(i, k) - 0.5) * 0.8, 0);
        d.rotateX(-out * 0.5);
        const hh = (0.45 + hash(i, k + 1) * 0.8) * sp.height * f * (1 - 0.35 * (rr / (o.w * 0.45)));
        d.scale.set(0.045 * (0.7 + hash(i, k + 7) * 0.8), hh, 1);
        d.updateMatrix(); m.setMatrixAt(n, d.matrix);
        const t = hash(i, k + 9);
        c.set(t > 0.82 ? "#e6d9a0" : t > 0.45 ? "#c9b86a" : "#9bab5c"); m.setColorAt(n, c); n++;
      }
    });
    m.count = n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  if (!items.length) return null;
  return <instancedMesh key={items.length} ref={ref} args={[BLADE, undefined, items.length * per]} castShadow><meshStandardMaterial roughness={0.85} side={THREE.DoubleSide} /></instancedMesh>;
}

/** Dense flowering shrub: leafy mound + instanced flower heads (hydrangea) or upright spikes (lavender). */
function Bush({ o }: { o: PlanObject }) {
  const sp = SPECIES[o.species ?? "hortensja"];
  const f = o.w / sp.d, H = sp.height * f, r = o.w / 2;
  const lav = o.species === "lawenda";
  const seed = o.x * 11 + o.y * 5;
  const fl = useRef<THREE.InstancedMesh>(null);
  const N = lav ? 70 : 26;
  useLayoutEffect(() => {
    const m = fl.current; if (!m) return;
    const d = new THREE.Object3D(), c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const th = hash(i, seed) * 6.283, ph = Math.acos(1 - hash(i, seed + 2) * (lav ? 0.85 : 0.7));
      const x = Math.sin(ph) * Math.cos(th) * r * 0.82, z = Math.sin(ph) * Math.sin(th) * r * 0.82, y = Math.cos(ph) * H * 0.42 + H * 0.5;
      d.position.set(x, y, z); d.rotation.set(0, hash(i, 3) * 6.28, 0);
      if (lav) { d.rotation.set((hash(i, 3) - 0.5) * 0.5, 0, (hash(i, 4) - 0.5) * 0.5); d.position.y = H * 0.55 + hash(i, 5) * H * 0.2; d.scale.set(0.03 * f + 0.01, H * 0.55, 0.03 * f + 0.01); }
      else { const s2 = r * (0.2 + hash(i, 6) * 0.12); d.scale.set(s2, s2 * 0.7, s2); }
      d.updateMatrix(); m.setMatrixAt(i, d.matrix);
      const t = hash(i, seed + 8);
      c.set(lav ? (t > 0.5 ? "#7b5fb5" : "#9a82cc") : t > 0.78 ? "#f0b7cf" : t > 0.5 ? "#e9e6f7" : t > 0.2 ? "#b4c2ee" : "#98a9e3"); m.setColorAt(i, c);
    }
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [r, H, f, lav, seed, N]);
  return (
    <group position={[o.x, 0, o.y]}>
      <mesh geometry={ICO} position={[0, H * 0.38, 0]} scale={[r * 1.05, H * 0.46, r * 1.05]} castShadow receiveShadow><meshStandardMaterial color={new THREE.Color(sp.color).multiplyScalar(0.8)} roughness={0.95} /></mesh>
      {Array.from({ length: 11 }, (_, i) => { const a = (i / 11) * 6.28 + seed; const rr = r * (0.45 + hash(i, seed) * 0.35); const s2 = r * (0.34 + hash(i, seed + 4) * 0.2); return <mesh key={i} geometry={ICO} position={[Math.cos(a) * rr, H * (0.3 + hash(i, 2) * 0.3), Math.sin(a) * rr]} scale={[s2, s2 * 0.8, s2]} castShadow><meshStandardMaterial color={new THREE.Color(sp.color).offsetHSL(0, 0, (hash(i, 9) - 0.5) * 0.08)} roughness={0.95} /></mesh>; })}
      <instancedMesh ref={fl} args={[lav ? CONE : FLORET, undefined, N]} castShadow><meshStandardMaterial roughness={1} flatShading /></instancedMesh>
    </group>
  );
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
      <Suspense fallback={null}><World project={project} quality={quality} /></Suspense>
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
