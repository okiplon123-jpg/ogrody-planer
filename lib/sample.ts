import type { PlanObject, Project, Kind } from "./types";
import { polyFromPoints, uid, type V2 } from "./geometry";
import { SPECIES } from "./catalog";

/** DEMONSTRATION data only — not the dimensions of a real property. */
const shape = (kind: Kind, pts: V2[], extra: Partial<PlanObject>): PlanObject => ({ id: uid(), kind, ...polyFromPoints(pts), ...extra });
const obj = (kind: Kind, x: number, y: number, w: number, h: number, extra: Partial<PlanObject> = {}): PlanObject =>
  ({ id: uid(), kind, x, y, w, h, rot: 0, ...extra });
const tree = (sp: string, x: number, y: number, d: number) => obj("tree", x, y, d, d, { species: sp });
const shrub = (sp: string, x: number, y: number, d: number) => obj("shrub", x, y, d, d, { species: sp });

export function sampleProject(): Project {
  const objects: PlanObject[] = [
    shape("lawn", [[3.5, 1], [20.5, 1], [20.5, 15.5], [15.3, 15.5], [15.3, 9.8], [3.5, 9.8]], { material: "tr-rolowany" }),
    shape("lawn", [[7.4, 25.2], [15.7, 25.2], [15.7, 28.5], [17.2, 28.5], [17.2, 35.4], [7.4, 35.4]], { material: "tr-siany" }),
    shape("bed", [[1, 1], [3.5, 1], [3.5, 15.5], [1, 15.5]], { material: "rb-kora" }),
    shape("bed", [[1, 25], [5, 25], [5, 31], [2.9, 35.4], [1, 35.4]], { material: "rb-ziemia" }),
    shape("surface", [[3.5, 9.8], [15.3, 9.8], [15.3, 15.5], [3.5, 15.5]], { material: "pt-wielko", pattern: "modern", use: "terrace", edging: "none" }),
    shape("surface", [[16, 24.6], [21, 24.6], [21, 36], [17.6, 36], [17.6, 28.5], [16, 28.5]], { material: "ph-granit", use: "driveway", edging: "light" }),
    shape("surface", [[5.2, 24.6], [6.8, 24.6], [6.8, 31.4], [4.8, 36], [3.2, 36], [5.2, 31.4]], { material: "ph-behaton", use: "path", edging: "graphite" }),
    obj("house", 9, 20, 14, 9, { height: 6.5, facade: "white" }),
    obj("garage", 18.5, 20.75, 5, 7.5, { height: 3.2, facade: "graphite" }),
    obj("pergola", 9.4, 13.4, 4.4, 3.2),
    obj("bench", 13.5, 10.9, 1.6, 0.5),
    obj("planter", 4.5, 10.8, 0.9, 0.9), obj("planter", 4.5, 14.6, 0.9, 0.9),
    obj("water", 14.2, 6.3, 3, 2.2),
    obj("hedge", 21.4, 8, 1.2, 14, { species: "zywoplot" }),
    obj("gate", 19.3, 36, 3.4, 0.3), obj("gate", 4, 36, 1.2, 0.3),
    tree("klon", 18.6, 4.2, 4), tree("brzoza", 9, 3.5, 3), tree("brzoza", 11.2, 3, 2.5),
    tree("swierk", 19.6, 12.5, 2.8), tree("klon", 12, 31.5, 4),
    shrub("hortensja", 2.2, 12.5, 1.2), shrub("hortensja", 2.2, 10.2, 1.1), shrub("hortensja", 2.2, 14.2, 1.1),
    shrub("lawenda", 2.3, 2.6, 0.7), shrub("lawenda", 2.3, 3.8, 0.7), shrub("lawenda", 2.3, 5.0, 0.7),
    obj("grass", 2.5, 26.6, 1, 1, { species: "trawy" }), obj("grass", 3.7, 28.3, 1.1, 1.1, { species: "trawy" }),
    obj("grass", 2.1, 29.6, 1, 1, { species: "trawy" }), obj("grass", 4.3, 26.2, 0.9, 0.9, { species: "trawy" }),
    obj("grass", 2.4, 32.6, 1, 1, { species: "trawy" }),
    ...([[7.4, 27], [7.4, 31.5], [15.5, 27], [17.3, 32], [3.1, 12.6], [15.6, 12.6], [9.4, 9.4], [2.9, 20.5]] as V2[]).map(([x, y]) => obj("light", x, y, 0.4, 0.4)),
  ];
  return { version: 1, name: "Projekt przykładowy", plot: { w: 22, l: 36 }, fence: { enabled: true, style: "graphite" }, lighting: "golden", objects };
}

export function emptyProject(w = 20, l = 30): Project {
  return { version: 1, name: "Nowy projekt", plot: { w, l }, fence: { enabled: false, style: "graphite" }, lighting: "day", objects: [] };
}
export const speciesOf = (o: PlanObject) => (o.species ? SPECIES[o.species] : undefined);
