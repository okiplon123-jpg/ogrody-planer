"use client";
import { useEffect, useMemo, useState } from "react";
import type { PlanObject, Project } from "@/lib/types";
import { localPoly } from "@/lib/geometry";
import { SPECIES, matById } from "@/lib/catalog";
import { TILE_M, textureUrl } from "@/lib/textures";

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

const ORDER = ["lawn", "bed", "surface", "water", "house", "garage", "fence", "hedge", "gate", "bench", "planter", "pergola", "grass", "shrub", "light", "tree"];
const patId = (mat: string, pat?: string) => `pat-${mat}-${pat ?? "x"}`;
const EDGE = { none: "rgba(0,0,0,.28)", graphite: "#25282a", light: "#e2dfd6" } as const;

function Patterns({ objects }: { objects: PlanObject[] }) {
  const defs = useMemo(() => {
    const seen = new Map<string, { mat: string; pat?: string }>();
    for (const o of objects) {
      if (!o.material) continue;
      const m = matById(o.material);
      const pat = m.tex === "bricks" ? o.pattern ?? m.pattern : undefined;
      seen.set(patId(m.id, pat), { mat: m.id, pat });
    }
    return [...seen].map(([id, v]) => ({ id, url: textureUrl(v.mat, v.pat as never) }));
  }, [objects]);
  return (
    <defs>
      {defs.map((d) => (
        <pattern key={d.id} id={d.id} patternUnits="userSpaceOnUse" width={TILE_M} height={TILE_M}>
          <image href={d.url} width={TILE_M} height={TILE_M} preserveAspectRatio="none" />
        </pattern>
      ))}
    </defs>
  );
}

const ring = (n: number, r: number, f: (x: number, y: number, i: number) => React.ReactNode) =>
  Array.from({ length: n }, (_, i) => f(Math.cos((i / n) * 6.283 + 0.4) * r, Math.sin((i / n) * 6.283 + 0.4) * r, i));

export function Glyph({ o, lit }: { o: PlanObject; lit: boolean }) {
  const r = o.w / 2;
  const sp = o.species ? SPECIES[o.species] : undefined;
  switch (o.kind) {
    case "surface":
    case "lawn":
    case "bed": {
      const m = matById(o.material);
      const pat = m.tex === "bricks" ? o.pattern ?? m.pattern : undefined;
      const pts = localPoly(o).map((p) => p.join(",")).join(" ");
      const e = o.kind === "surface" ? o.edging ?? "none" : "none";
      return <polygon points={pts} fill={`url(#${patId(m.id, pat)})`} stroke={o.kind === "bed" ? "#33261b" : EDGE[e]} strokeWidth={e === "none" ? 0.04 : 0.16} strokeLinejoin="round" />;
    }
    case "house":
      return (
        <g>
          <rect x={-o.w / 2} y={-o.h / 2} width={o.w} height={o.h} fill="#e6e1d5" stroke="#1d2220" strokeWidth={0.12} />
          <rect x={-o.w / 2 + 0.5} y={-o.h / 2 + 0.5} width={o.w - 1} height={o.h - 1} fill="#cfc9ba" stroke="#a9a290" strokeWidth={0.05} />
          <line x1={-o.w / 2 + 0.5} y1={0} x2={o.w / 2 - 0.5} y2={0} stroke="#a9a290" strokeWidth={0.06} />
          <rect x={-o.w * 0.2 - 0.6} y={o.h / 2 - 0.1} width={1.2} height={0.3} fill="#6b4a30" />
          <text y={0.25} textAnchor="middle" fontSize={0.8} fill="#5a5648" letterSpacing={0.15} style={{ pointerEvents: "none" }}>DOM</text>
        </g>
      );
    case "garage":
      return (
        <g>
          <rect x={-o.w / 2} y={-o.h / 2} width={o.w} height={o.h} fill="#d6d2c6" stroke="#1d2220" strokeWidth={0.12} />
          <rect x={-o.w / 2 + 0.35} y={-o.h / 2 + 0.35} width={o.w - 0.7} height={o.h - 0.7} fill="#c6c1b2" />
          <line x1={-o.w / 2 + 0.3} y1={o.h / 2 - 0.05} x2={o.w / 2 - 0.3} y2={o.h / 2 - 0.05} stroke="#25282a" strokeWidth={0.22} />
        </g>
      );
    case "tree": {
      const cone = sp?.style === "cone";
      return (
        <g>
          <circle cx={r * 0.14} cy={r * 0.16} r={r} fill="rgba(0,0,0,.24)" />
          <circle r={r} fill={sp?.color} />
          {cone
            ? [0.78, 0.55, 0.32].map((k, i) => <circle key={i} r={r * k} fill={i % 2 ? sp?.color : "#2b6045"} opacity={0.9} stroke="rgba(0,0,0,.2)" strokeWidth={0.04} />)
            : ring(6, r * 0.5, (x, y, i) => <circle key={i} cx={x} cy={y} r={r * 0.42} fill={i % 2 ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.12)"} />)}
          {sp?.style === "round" && <circle cx={-r * 0.2} cy={-r * 0.2} r={r * 0.35} fill={sp.accent} opacity={0.35} />}
          <circle r={0.1} fill="#3a2a1d" />
        </g>
      );
    }
    case "shrub":
      return (
        <g>
          <circle cx={r * 0.12} cy={r * 0.14} r={r} fill="rgba(0,0,0,.2)" />
          <circle r={r} fill={sp?.color} />
          {ring(7, r * 0.55, (x, y, i) => <circle key={i} cx={x} cy={y} r={r * 0.3} fill={sp?.accent} opacity={0.85} />)}
        </g>
      );
    case "grass":
      return (
        <g stroke={sp?.color} strokeWidth={0.06} strokeLinecap="round">
          <circle r={r} fill="rgba(60,50,20,.18)" stroke="none" />
          {ring(16, r * 0.9, (x, y, i) => <line key={i} x1={x * 0.15} y1={y * 0.15} x2={x} y2={y} stroke={i % 2 ? sp?.accent : sp?.color} />)}
        </g>
      );
    case "hedge":
      return (
        <g>
          <rect x={-o.w / 2} y={-o.h / 2} width={o.w} height={o.h} rx={Math.min(o.w, o.h) / 2.2} fill={sp?.color ?? "#2c5c3c"} stroke="rgba(0,0,0,.35)" strokeWidth={0.05} />
          {Array.from({ length: Math.max(2, Math.round(Math.max(o.w, o.h) / 0.9)) }, (_, i, ) => {
            const n = Math.max(2, Math.round(Math.max(o.w, o.h) / 0.9));
            const t = (i + 0.5) / n - 0.5;
            return o.h > o.w ? <circle key={i} cy={t * o.h} r={o.w * 0.28} fill="rgba(255,255,255,.1)" /> : <circle key={i} cx={t * o.w} r={o.h * 0.28} fill="rgba(255,255,255,.1)" />;
          })}
        </g>
      );
    case "fence":
      return <rect x={-o.w / 2} y={-o.h / 2} width={o.w} height={o.h} fill="#24282a" />;
    case "gate":
      return (
        <g>
          <rect x={-o.w / 2 - 0.1} y={-0.35} width={o.w + 0.2} height={0.7} fill="#a39a86" />
          <rect x={-o.w / 2 - 0.12} y={-0.22} width={0.24} height={0.44} fill="#1d2022" />
          <rect x={o.w / 2 - 0.12} y={-0.22} width={0.24} height={0.44} fill="#1d2022" />
          <line x1={-o.w / 2 + 0.1} y1={0} x2={o.w / 2 - 0.1} y2={0} stroke="#3d4448" strokeWidth={0.08} strokeDasharray="0.2 0.12" />
        </g>
      );
    case "pergola":
      return (
        <g>
          <rect x={-o.w / 2} y={-o.h / 2} width={o.w} height={o.h} fill="rgba(60,45,30,.12)" stroke="#4d3d2e" strokeWidth={0.1} />
          {Array.from({ length: Math.floor(o.w / 0.4) }, (_, i) => <line key={i} x1={-o.w / 2 + 0.2 + i * 0.4} y1={-o.h / 2} x2={-o.w / 2 + 0.2 + i * 0.4} y2={o.h / 2} stroke="#5b4a3a" strokeWidth={0.1} />)}
          {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([a, b], i) => <rect key={i} x={a * o.w / 2 - 0.1} y={b * o.h / 2 - 0.1} width={0.2} height={0.2} fill="#2b2d2e" />)}
        </g>
      );
    case "bench":
      return (
        <g>
          <rect x={-o.w / 2} y={-o.h / 2} width={o.w} height={o.h} fill="#8a6a4a" stroke="#3b2c1e" strokeWidth={0.04} />
          {[-0.12, 0, 0.12].map((y) => <line key={y} x1={-o.w / 2} x2={o.w / 2} y1={y * o.h * 2} y2={y * o.h * 2} stroke="#3b2c1e" strokeWidth={0.03} />)}
        </g>
      );
    case "planter":
      return (
        <g>
          <rect x={-r} y={-r} width={o.w} height={o.w} rx={0.06} fill="#46494a" stroke="#202324" strokeWidth={0.05} />
          <circle r={r * 0.72} fill="#5e8a46" />{ring(5, r * 0.35, (x, y, i) => <circle key={i} cx={x} cy={y} r={r * 0.22} fill="#86b062" />)}
        </g>
      );
    case "water":
      return (
        <g>
          <ellipse rx={o.w / 2 + 0.18} ry={o.h / 2 + 0.18} fill="#8d8f88" />
          <ellipse rx={o.w / 2} ry={o.h / 2} fill="#4f9bbd" />
          <ellipse rx={o.w / 3.2} ry={o.h / 3.2} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth={0.04} />
          <ellipse rx={o.w / 6} ry={o.h / 6} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth={0.04} />
        </g>
      );
    case "light":
      return (
        <g>
          {lit && <circle r={0.95} fill="rgba(255,214,130,.28)" />}
          <circle r={0.18} fill="#ffd98a" stroke="#6a5530" strokeWidth={0.04} />
        </g>
      );
  }
}

export function Ground({ project }: { project: Project }) {
  const { w, l } = project.plot;
  return (
    <g>
      <rect x={-40} y={-40} width={w + 80} height={l + 40} fill="#c4c3b8" />
      <rect x={-40} y={l} width={w + 80} height={1.8} fill="#9a9d96" />
      <rect x={-40} y={l + 1.8} width={w + 80} height={7} fill="#2b2f2e" />
      <line x1={-40} x2={w + 40} y1={l + 5.3} y2={l + 5.3} stroke="#d8d6cf" strokeWidth={0.12} strokeDasharray="2 1.4" />
      <rect x={0} y={0} width={w} height={l} fill="#a89f88" />
    </g>
  );
}

export function PlanLayer({ project, grid = false, children }: { project: Project; grid?: boolean; children?: React.ReactNode }) {
  const mounted = useMounted();
  const { w, l } = project.plot;
  const lit = project.lighting !== "day";
  const sorted = useMemo(() => [...project.objects].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)), [project.objects]);
  return (
    <g>
      <Ground project={project} />
      {mounted && <Patterns objects={project.objects} />}
      {grid && (
        <g stroke="#000" strokeOpacity={0.09} strokeWidth={0.02} pointerEvents="none">
          {Array.from({ length: Math.floor(w) + 1 }, (_, i) => <line key={`v${i}`} x1={i} x2={i} y1={0} y2={l} strokeOpacity={i % 5 ? 0.09 : 0.2} />)}
          {Array.from({ length: Math.floor(l) + 1 }, (_, i) => <line key={`h${i}`} y1={i} y2={i} x1={0} x2={w} strokeOpacity={i % 5 ? 0.09 : 0.2} />)}
        </g>
      )}
      {mounted && sorted.map((o) => (
        <g key={o.id} data-id={o.id} transform={`translate(${o.x} ${o.y}) rotate(${o.rot})`}>
          <Glyph o={o} lit={lit} />
        </g>
      ))}
      {project.fence.enabled && <rect x={0} y={0} width={w} height={l} fill="none" stroke={project.fence.style === "wood" ? "#7b5a3c" : project.fence.style === "light" ? "#d7d4c8" : "#202426"} strokeWidth={0.16} pointerEvents="none" />}
      {mounted && project.objects.filter((o) => o.kind === "gate").map((o) => <g key={"g" + o.id} transform={`translate(${o.x} ${o.y}) rotate(${o.rot})`} pointerEvents="none"><Glyph o={o} lit={lit} /></g>)}
      {children}
    </g>
  );
}
