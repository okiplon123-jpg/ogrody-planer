import type { Project } from "./types";
import { objectArea } from "./geometry";
import { matById } from "./catalog";

export interface Summary {
  driveway: number; terrace: number; path: number; other: number; lawn: number; beds: number;
  paved: number; plot: number; byMaterial: { id: string; name: string; area: number; withWaste: number }[];
  counts: { trees: number; shrubs: number; lights: number };
}
/** All values computed from the live project geometry; overlapping objects are NOT de-duplicated (estimate). */
export function summarize(p: Project, waste: number): Summary {
  const s: Summary = { driveway: 0, terrace: 0, path: 0, other: 0, lawn: 0, beds: 0, paved: 0, plot: p.plot.w * p.plot.l, byMaterial: [], counts: { trees: 0, shrubs: 0, lights: 0 } };
  const mats = new Map<string, number>();
  for (const o of p.objects) {
    const a = objectArea(o);
    if (o.kind === "surface") { s[o.use ?? "other"] += a; s.paved += a; }
    if (o.kind === "lawn") s.lawn += a;
    if (o.kind === "bed") s.beds += a;
    if (["surface", "lawn", "bed"].includes(o.kind) && o.material) mats.set(o.material, (mats.get(o.material) ?? 0) + a);
    if (o.kind === "tree") s.counts.trees++;
    if (o.kind === "shrub" || o.kind === "grass") s.counts.shrubs++;
    if (o.kind === "light") s.counts.lights++;
  }
  s.byMaterial = [...mats].map(([id, area]) => ({ id, name: matById(id).name, area, withWaste: area * (1 + waste / 100) }));
  return s;
}
