"use client";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as THREE from "three";
import type { Lighting, PlanObject, Project } from "@/lib/types";
import { localPoly, localToWorld, objectArea, pointInPoly } from "@/lib/geometry";
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

const FACADE = { white: "#ebe7de", graphite: "#4a4f53", wood: "#a07a54" } as const;

/* ---------- procedural surface textures for buildings (neutral, tinted by the material colour) ---------- */
const bTex = new Map<string, THREE.CanvasTexture>();
function buildingTex(kind: "plaster" | "roof" | "wood", rx: number, ry: number) {
  const key = `${kind}|${rx}|${ry}`;
  let t = bTex.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d")!;
  if (kind === "plaster") {
    g.fillStyle = "#f2f2f2"; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3500; i++) { g.fillStyle = `rgba(${hash(i, 1) > 0.5 ? "0,0,0" : "255,255,255"},${0.03 + hash(i, 2) * 0.05})`; g.fillRect(hash(i, 3) * 256, hash(i, 4) * 256, 1 + hash(i, 5) * 2, 1 + hash(i, 6) * 2); }
  } else if (kind === "roof") {
    g.fillStyle = "#cfcfcf"; g.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) {
      const x = q * 32 + (r % 2) * 16, y = r * 32;
      g.fillStyle = `rgb(${200 + hash(r * 9 + q, 7) * 40},${200 + hash(r * 9 + q, 7) * 40},${200 + hash(r * 9 + q, 7) * 40})`;
      g.fillRect(x + 1, y + 1, 30, 30);
      g.fillStyle = "rgba(0,0,0,.28)"; g.fillRect(x, y + 28, 32, 4);
    }
  } else {
    g.fillStyle = "#e6e6e6"; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + hash(i, 8) * 0.07})`; g.fillRect(i * 32, 0, 32, 256); g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(i * 32, 0, 2, 256); }
    for (let i = 0; i < 700; i++) { g.fillStyle = "rgba(0,0,0,.05)"; g.fillRect(hash(i, 9) * 256, hash(i, 10) * 256, 1, 8 + hash(i, 11) * 20); }
  }
  t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  bTex.set(key, t);
  return t;
}

const Frame = "#2a2e31";
/** Window / glazed door: frame, glass with reflections, mullions, sill. Faces local +z. */
function Win({ x, y, z, w, h, ry = 0, lit, door = false, cross = true }: { x: number; y: number; z: number; w: number; h: number; ry?: number; lit: number; door?: boolean; cross?: boolean }) {
  return (
    <group position={[x, y, z]} rotation={[0, ry, 0]}>
      <mesh position={[0, 0, 0.02]}><boxGeometry args={[w + 0.16, h + 0.16, 0.1]} /><meshStandardMaterial color={Frame} roughness={0.5} /></mesh>
      <mesh position={[0, 0, 0.075]}>
        <boxGeometry args={[w, h, 0.03]} />
        <meshStandardMaterial color="#1f2d38" metalness={0.85} roughness={0.07} emissive="#ffc67a" emissiveIntensity={lit * 0.9} envMapIntensity={1.6} />
      </mesh>
      <mesh position={[0, 0, 0.1]}><boxGeometry args={[0.05, h, 0.04]} /><meshStandardMaterial color={Frame} /></mesh>
      {cross && h > 1.3 && <mesh position={[0, door ? h * 0.15 : 0, 0.1]}><boxGeometry args={[w, 0.05, 0.04]} /><meshStandardMaterial color={Frame} /></mesh>}
      {!door && <mesh position={[0, -h / 2 - 0.1, 0.1]} castShadow><boxGeometry args={[w + 0.3, 0.07, 0.24]} /><meshStandardMaterial color="#d8d5ce" roughness={0.8} /></mesh>}
    </group>
  );
}

function House({ o, lit }: { o: PlanObject; lit: number }) {
  const w = o.w, d = o.h, Hw = o.height ?? 6;
  const gable = (o.roof ?? "gable") === "gable";
  const floors = Hw > 4.2 ? 2 : 1, fh = Hw / floors;
  const Hr = gable ? Math.min(3.4, d * 0.3) : 0, ov = 0.55;
  const wall = FACADE[o.facade ?? "white"];
  const plaster = buildingTex("plaster", Math.max(2, w / 3), Math.max(2, Hw / 3));
  const roofTex = buildingTex("roof", Math.max(3, w / 2), 4);
  const ang = Math.atan2(Hr, d / 2), slopeLen = (d / 2 + ov) / Math.cos(ang || 1e-6);
  const gableGeo = useMemo(() => {
    if (!gable) return null;
    const sh = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, Hr)]);
    return new THREE.ExtrudeGeometry(sh, { depth: w - 0.04, bevelEnabled: false });
  }, [gable, d, Hr, w]);
  const n = Math.max(2, Math.floor(w / 3.6));
  const xs = Array.from({ length: n }, (_, i) => -w / 2 + ((i + 0.5) * w) / n);
  const doorX = -w * 0.22;
  const roofMat = <meshStandardMaterial color="#35393d" map={roofTex} roughness={0.75} />;
  return (
    <group position={[o.x, 0, o.y]} rotation={ROT_Y(o)}>
      <mesh position={[0, 0.2, 0]} receiveShadow><boxGeometry args={[w + 0.12, 0.4, d + 0.12]} /><meshStandardMaterial color="#3b3f43" roughness={0.9} /></mesh>
      <mesh position={[0, Hw / 2 + 0.2, 0]} castShadow receiveShadow><boxGeometry args={[w, Hw - 0.4 + 0.4, d]} /><meshStandardMaterial color={wall} map={plaster} roughness={0.95} /></mesh>
      {floors === 2 && <mesh position={[0, fh + 0.2, 0]}><boxGeometry args={[w + 0.05, 0.1, d + 0.05]} /><meshStandardMaterial color={new THREE.Color(wall).multiplyScalar(0.8)} roughness={0.9} /></mesh>}

      {gable ? (
        <>
          {gableGeo && <mesh geometry={gableGeo} position={[-(w - 0.04) / 2, Hw + 0.2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow><meshStandardMaterial color={wall} map={plaster} roughness={0.95} /></mesh>}
          {[1, -1].map((sd) => (
            <mesh key={sd} position={[0, Hw + 0.2 + Hr / 2 - ((ov * Math.tan(ang)) / 2) + 0.05, (sd * (d / 2 + ov)) / 2]} rotation={[sd * ang, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[w + ov * 2, 0.2, slopeLen]} />{roofMat}
            </mesh>
          ))}
          <mesh position={[0, Hw + 0.2 + Hr + 0.12, 0]}><boxGeometry args={[w + ov * 2, 0.14, 0.34]} /><meshStandardMaterial color="#25282b" roughness={0.6} /></mesh>
          {[1, -1].map((sd) => <mesh key={"g" + sd} position={[0, Hw + 0.2 - ov * Math.tan(ang) - 0.02, sd * (d / 2 + ov)]}><boxGeometry args={[w + ov * 2, 0.12, 0.1]} /><meshStandardMaterial color="#2a2e31" roughness={0.5} metalness={0.3} /></mesh>)}
          <mesh position={[w * 0.28, Hw + Hr + 0.55, -d * 0.1]} castShadow><boxGeometry args={[0.7, 1.9, 0.7]} /><meshStandardMaterial color="#8a4b38" roughness={0.9} /></mesh>
          <mesh position={[w * 0.28, Hw + Hr + 1.55, -d * 0.1]}><boxGeometry args={[0.9, 0.12, 0.9]} /><meshStandardMaterial color="#2a2d2f" /></mesh>
          {/* attic window in each gable */}
          {[1, -1].map((sd) => <Win key={"a" + sd} x={sd * (w / 2)} y={Hw + 0.2 + Hr * 0.3} z={0} w={0.8} h={0.8} ry={sd * Math.PI / 2} lit={lit} cross={false} />)}
        </>
      ) : (
        <>
          {/* modern flat roof: slim overhanging slab with a low parapet, no rooftop box */}
          <mesh position={[0, Hw + 0.3, 0]} castShadow receiveShadow><boxGeometry args={[w + 0.5, 0.26, d + 0.5]} /><meshStandardMaterial color="#2b2f32" roughness={0.7} /></mesh>
          {[[0, d / 2 + 0.2, w + 0.5, 0.14], [0, -d / 2 - 0.2, w + 0.5, 0.14], [w / 2 + 0.2, 0, 0.14, d + 0.5], [-w / 2 - 0.2, 0, 0.14, d + 0.5]].map(([px, pz, sx, sz], i) => (
            <mesh key={"p" + i} position={[px, Hw + 0.56, pz]} castShadow><boxGeometry args={[sx, 0.3, sz]} /><meshStandardMaterial color="#25282b" roughness={0.6} /></mesh>
          ))}
          <mesh position={[0, Hw + 0.46, 0]} receiveShadow><boxGeometry args={[w - 0.2, 0.06, d - 0.2]} /><meshStandardMaterial color="#8d908f" roughness={0.95} /></mesh>
        </>
      )}

      {/* front (+z): door + windows */}
      {Array.from({ length: floors }, (_, f) => xs.map((x, i) => {
        if (f === 0 && Math.abs(x - doorX) < 1.5) return null;
        const h = f === 0 ? 1.9 : 1.5, ww = f === 0 ? 1.5 : 1.3;
        return <Win key={`f${f}${i}`} x={x} y={f * fh + 0.2 + 0.95 + h / 2} z={d / 2} w={ww} h={h} lit={lit} />;
      }))}
      <group position={[doorX, 0, d / 2]}>
        <mesh position={[0, 1.2, 0.02]}><boxGeometry args={[1.3, 2.5, 0.1]} /><meshStandardMaterial color={Frame} /></mesh>
        <mesh position={[0, 1.15, 0.08]}><boxGeometry args={[1.1, 2.3, 0.05]} /><meshStandardMaterial color="#6b4a30" map={buildingTex("wood", 1, 1)} roughness={0.7} /></mesh>
        <mesh position={[0.4, 1.1, 0.13]}><boxGeometry args={[0.04, 0.5, 0.04]} /><meshStandardMaterial color="#c9c9c4" metalness={0.8} roughness={0.3} /></mesh>
        <mesh position={[0, 2.75, 0.55]} castShadow><boxGeometry args={[2.4, 0.14, 1.1]} /><meshStandardMaterial color="#2b2f32" roughness={0.6} /></mesh>
        {[0, 1].map((k) => <mesh key={k} position={[0, 0.07 + k * 0.14, 0.75 - k * 0.22]} receiveShadow castShadow><boxGeometry args={[1.8, 0.14, 0.5]} /><meshStandardMaterial color="#9b9892" roughness={0.9} /></mesh>)}
        <pointLight position={[0, 2.6, 0.6]} intensity={lit * 3} distance={5} color="#ffcf8a" />
      </group>

      {/* back (-z): patio doors + windows */}
      <Win x={0} y={0.2 + 1.2} z={-d / 2} w={Math.min(4, w * 0.4)} h={2.3} ry={Math.PI} lit={lit} door />
      {Array.from({ length: floors - 1 }, (_, f) => xs.map((x, i) => <Win key={`b${f}${i}`} x={x} y={(f + 1) * fh + 0.2 + 0.95 + 0.75} z={-d / 2} w={1.3} h={1.5} ry={Math.PI} lit={lit} />))}
      {/* sides (±x) */}
      {[1, -1].flatMap((sd) => Array.from({ length: floors }, (_, f) => <Win key={`s${sd}${f}`} x={sd * (w / 2)} y={f * fh + 0.2 + 0.95 + 0.75} z={0} w={1.2} h={1.5} ry={sd * Math.PI / 2} lit={lit} />))}
    </group>
  );
}

function Garage({ o, lit }: { o: PlanObject; lit: number }) {
  const H = o.height ?? 3, big = o.w > 4.2;
  const plaster = buildingTex("plaster", Math.max(2, o.w / 3), 1.5);
  return (
    <group position={[o.x, 0, o.y]} rotation={ROT_Y(o)}>
      <mesh position={[0, 0.15, 0]}><boxGeometry args={[o.w + 0.1, 0.3, o.h + 0.1]} /><meshStandardMaterial color="#3b3f43" roughness={0.9} /></mesh>
      <mesh position={[0, H / 2 + 0.15, 0]} castShadow receiveShadow><boxGeometry args={[o.w, H, o.h]} /><meshStandardMaterial color={FACADE[o.facade ?? "white"]} map={plaster} roughness={0.95} /></mesh>
      <mesh position={[0, H + 0.25, 0]} castShadow><boxGeometry args={[o.w + 0.3, 0.2, o.h + 0.3]} /><meshStandardMaterial color="#2b2f32" roughness={0.7} /></mesh>
      {big ? (
        <>
          <mesh position={[0, 1.2, o.h / 2 + 0.04]}><boxGeometry args={[o.w * 0.82, 2.4, 0.08]} /><meshStandardMaterial color="#464b4f" roughness={0.55} metalness={0.2} /></mesh>
          {[0.6, 1.2, 1.8].map((y) => <mesh key={y} position={[0, y, o.h / 2 + 0.09]}><boxGeometry args={[o.w * 0.82, 0.025, 0.02]} /><meshStandardMaterial color="#1f2224" /></mesh>)}
          <mesh position={[0, 2.5, o.h / 2 + 0.1]}><boxGeometry args={[o.w * 0.72, 0.06, 0.04]} /><meshStandardMaterial color="#fff0c8" emissive="#ffd9a0" emissiveIntensity={lit * 1.5} /></mesh>
        </>
      ) : <Win x={0} y={1.6} z={o.h / 2} w={1.1} h={1.1} lit={lit} />}
      {big && <Win x={o.w / 2} y={1.6} z={0} w={0.9} h={0.9} ry={Math.PI / 2} lit={lit} cross={false} />}
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
  const per = 140;
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

/** Leafy shrub: hundreds of instanced leaves facing outward, plus flower heads (hydrangea) or spikes (lavender). */
const LEAF = new THREE.IcosahedronGeometry(1, 1).scale(1, 0.62, 0.16);
function Bush({ o }: { o: PlanObject }) {
  const sp = SPECIES[o.species ?? "hortensja"];
  const f = o.w / sp.d, H = sp.height * f, r = o.w / 2;
  const lav = o.species === "lawenda";
  const seed = o.x * 11 + o.y * 5;
  const leaves = useRef<THREE.InstancedMesh>(null);
  const fl = useRef<THREE.InstancedMesh>(null);
  const NL = lav ? 70 : 190, NF = lav ? 80 : 110;
  useLayoutEffect(() => {
    const d = new THREE.Object3D(), c = new THREE.Color();
    const m = leaves.current;
    if (m) {
      for (let i = 0; i < NL; i++) {
        const th = hash(i, seed) * 6.283, u = hash(i, seed + 2);
        if (lav) {
          // narrow upright leaves at the base
          const rr = Math.sqrt(hash(i, seed + 3)) * r * 0.9;
          d.position.set(Math.cos(th) * rr, 0, Math.sin(th) * rr);
          d.rotation.set((hash(i, 5) - 0.5) * 0.7, th, (hash(i, 6) - 0.5) * 0.7);
          d.scale.set(0.016 * f + 0.008, H * (0.35 + hash(i, 7) * 0.35), 0.012);
          d.updateMatrix(); m.setMatrixAt(i, d.matrix); d.rotation.set(0, 0, 0);
          c.set(sp.color).offsetHSL(0, 0, (hash(i, 8) - 0.5) * 0.12 + 0.08);
        } else {
          const phi = Math.acos(1 - u * 0.96);
          const rad = r * (0.78 + 0.22 * hash(i, seed + 4));
          const px = Math.sin(phi) * Math.cos(th) * rad, pz = Math.sin(phi) * Math.sin(th) * rad, py = Math.cos(phi) * H * 0.5 + H * 0.42;
          d.position.set(px, py, pz);
          d.lookAt(px * 2, py + (py - H * 0.42) * 0.6, pz * 2);
          const sz = r * (0.2 + hash(i, 9) * 0.14);
          d.scale.set(sz, sz, sz);
          d.updateMatrix(); m.setMatrixAt(i, d.matrix);
          c.set(sp.color).offsetHSL((hash(i, 10) - 0.5) * 0.03, (hash(i, 11) - 0.5) * 0.1, (hash(i, 12) - 0.5) * 0.16);
        }
        m.setColorAt(i, c);
      }
      m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
    const q = fl.current;
    if (q) {
      d.rotation.set(0, 0, 0); d.quaternion.identity();
      const heads = lav ? NF : Math.floor(NF / 5);
      for (let h = 0; h < heads; h++) {
        const th = hash(h, seed + 20) * 6.283, ph = Math.acos(1 - hash(h, seed + 21) * 0.8);
        const hx = Math.sin(ph) * Math.cos(th) * r * 0.85, hz = Math.sin(ph) * Math.sin(th) * r * 0.85, hy = Math.cos(ph) * H * 0.45 + H * 0.58;
        const tone = hash(h, seed + 22);
        if (lav) {
          d.position.set(hx * 0.8, H * 0.6 + hash(h, 23) * H * 0.2, hz * 0.8);
          d.scale.set(0.026 * f + 0.01, H * 0.5, 0.026 * f + 0.01);
          d.rotation.set((hash(h, 24) - 0.5) * 0.5, 0, (hash(h, 25) - 0.5) * 0.5);
          d.updateMatrix(); q.setMatrixAt(h, d.matrix);
          q.setColorAt(h, c.set(tone > 0.5 ? "#7b5fb5" : "#9a82cc"));
        } else {
          d.rotation.set(0, 0, 0);
          for (let k = 0; k < 5; k++) {
            const idx = h * 5 + k; if (idx >= NF) break;
            const ox = (k === 0 ? 0 : Math.cos(k * 1.57) * r * 0.1), oz = (k === 0 ? 0 : Math.sin(k * 1.57) * r * 0.1), oy = k === 0 ? r * 0.06 : 0;
            d.position.set(hx + ox, hy + oy, hz + oz);
            const sz = r * (0.085 + hash(idx, 26) * 0.03); d.scale.set(sz, sz, sz);
            d.updateMatrix(); q.setMatrixAt(idx, d.matrix);
            q.setColorAt(idx, c.set(tone > 0.8 ? "#f2bfd4" : tone > 0.5 ? "#ece9f8" : tone > 0.2 ? "#b9c6f0" : "#9aaee6"));
          }
        }
      }
      q.count = lav ? heads : Math.min(NF, heads * 5);
      q.instanceMatrix.needsUpdate = true; if (q.instanceColor) q.instanceColor.needsUpdate = true;
    }
  }, [r, H, f, lav, seed, NL, NF, sp.color]);
  return (
    <group position={[o.x, 0, o.y]} rotation={ROT_Y(o)}>
      {!lav && <mesh geometry={ICO} position={[0, H * 0.4, 0]} scale={[r * 0.8, H * 0.38, r * 0.8]} castShadow receiveShadow><meshStandardMaterial color={new THREE.Color(sp.color).multiplyScalar(0.55)} roughness={1} /></mesh>}
      <instancedMesh ref={leaves} args={[lav ? CONE : LEAF, undefined, NL]} castShadow receiveShadow><meshStandardMaterial roughness={0.8} side={THREE.DoubleSide} /></instancedMesh>
      <instancedMesh ref={fl} args={[lav ? CONE : ICO, undefined, NF]} castShadow><meshStandardMaterial roughness={0.85} /></instancedMesh>
    </group>
  );
}

/** Thousands of short curved blades scattered over each lawn polygon (high quality only). */
function LawnBlades({ lawns }: { lawns: PlanObject[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const out: { x: number; z: number; h: number; ry: number; lean: number; c: number }[] = [];
    lawns.forEach((o, k) => {
      const poly = localPoly(o), target = Math.min(9000, Math.round(objectArea(o) * 55));
      let placed = 0;
      for (let t = 0; t < target * 5 && placed < target; t++) {
        const lx = (hash(t + k * 977, 1) - 0.5) * o.w, ly = (hash(t + k * 977, 2) - 0.5) * o.h;
        if (!pointInPoly([lx, ly], poly)) continue;
        const [x, z] = localToWorld(o, [lx, ly]);
        out.push({ x, z, h: 0.05 + hash(t, 3 + k) * 0.08, ry: hash(t, 4) * 6.283, lean: (hash(t, 5) - 0.3) * 0.5, c: hash(t, 6) });
        placed++;
      }
    });
    return out.slice(0, 26000);
  }, [lawns]);
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    const d = new THREE.Object3D(), c = new THREE.Color();
    data.forEach((b, i) => {
      d.position.set(b.x, 0.035, b.z); d.rotation.set(b.lean, b.ry, 0); d.scale.set(0.018, b.h, 1); d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, c.set(b.c > 0.7 ? "#9cc468" : b.c > 0.3 ? "#6f9f45" : "#558a35"));
    });
    m.count = data.length; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [data]);
  if (!data.length) return null;
  return <instancedMesh key={data.length} ref={ref} args={[BLADE, undefined, data.length]} receiveShadow><meshStandardMaterial roughness={0.9} side={THREE.DoubleSide} /></instancedMesh>;
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
  const lawns = useMemo(() => objs.filter((o) => o.kind === "lawn"), [objs]);
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
      {quality === "high" && <LawnBlades lawns={lawns} />}
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
