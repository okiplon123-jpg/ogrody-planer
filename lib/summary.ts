import type { PlanObject, Project } from "./types";
import { localPoly, objectArea } from "./geometry";
import { matById } from "./catalog";

export interface Summary {
  driveway: number; terrace: number; path: number; other: number; lawn: number; beds: number;
  paved: number; plot: number;
  byMaterial: { id: string; name: string; kind: string; area: number; withWaste: number }[];
  /** metres of edging along surfaces that have an edge chosen */
  edging: number;
  fence: number; hedge: number;
  /** estimated mulch volume for beds that use bark, at a 5 cm layer */
  mulchM3: number;
  counts: { trees: number; shrubs: number; grasses: number; lights: number; planters: number; benches: number; pergolas: number; water: number };
}

const perimeter = (o: PlanObject) => {
  const p = localPoly(o);
  let l = 0;
  for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; l += Math.hypot(b[0] - a[0], b[1] - a[1]); }
  return l;
};

/** All values computed from the live project geometry; overlapping objects are NOT de-duplicated (estimate). */
export function summarize(p: Project, waste: number): Summary {
  const s: Summary = {
    driveway: 0, terrace: 0, path: 0, other: 0, lawn: 0, beds: 0, paved: 0, plot: p.plot.w * p.plot.l,
    byMaterial: [], edging: 0, fence: 0, hedge: 0, mulchM3: 0,
    counts: { trees: 0, shrubs: 0, grasses: 0, lights: 0, planters: 0, benches: 0, pergolas: 0, water: 0 },
  };
  const mats = new Map<string, number>();
  let gateWidth = 0;
  for (const o of p.objects) {
    const a = objectArea(o);
    if (o.kind === "surface") { s[o.use ?? "other"] += a; s.paved += a; if (o.edging && o.edging !== "none") s.edging += perimeter(o); }
    if (o.kind === "lawn") s.lawn += a;
    if (o.kind === "bed") { s.beds += a; if (matById(o.material).id === "rb-kora") s.mulchM3 += a * 0.05; }
    if (["surface", "lawn", "bed"].includes(o.kind) && o.material) mats.set(o.material, (mats.get(o.material) ?? 0) + a);
    if (o.kind === "tree") s.counts.trees++;
    if (o.kind === "shrub") s.counts.shrubs++;
    if (o.kind === "grass") s.counts.grasses++;
    if (o.kind === "light") s.counts.lights++;
    if (o.kind === "planter") s.counts.planters++;
    if (o.kind === "bench") s.counts.benches++;
    if (o.kind === "pergola") s.counts.pergolas++;
    if (o.kind === "water") s.counts.water++;
    if (o.kind === "gate") gateWidth += o.w;
    if (o.kind === "fence") s.fence += Math.max(o.w, o.h);
    if (o.kind === "hedge") s.hedge += Math.max(o.w, o.h);
  }
  if (p.fence.enabled) s.fence += Math.max(0, 2 * (p.plot.w + p.plot.l) - gateWidth);
  s.byMaterial = [...mats].map(([id, area]) => { const m = matById(id); return { id, name: m.name, kind: m.kind, area, withWaste: area * (1 + waste / 100) }; });
  s.byMaterial.sort((a, b) => b.area - a.area);
  return s;
}

export const fmtM2 = (v: number) => `${v.toFixed(1).replace(".", ",")} m²`;
export const fmtM = (v: number) => `${v.toFixed(1).replace(".", ",")} m`;
export const fmtM3 = (v: number) => `${v.toFixed(2).replace(".", ",")} m³`;
