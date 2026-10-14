import type { PlanObject } from "./types";

export type V2 = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;

export function rotate([x, y]: V2, deg: number): V2 {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return [x * c - y * s, x * s + y * c];
}
export const localToWorld = (o: PlanObject, p: V2): V2 => {
  const r = rotate(p, o.rot);
  return [o.x + r[0], o.y + r[1]];
};
export const worldToLocal = (o: PlanObject, p: V2): V2 => rotate([p[0] - o.x, p[1] - o.y], -o.rot);

export function polyArea(pts: V2[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/** Real area in m² (polygon shoelace scaled by w*h, ellipse for round kinds) */
export function objectArea(o: PlanObject): number {
  if (o.poly) return polyArea(o.poly) * o.w * o.h;
  if (o.kind === "water") return Math.PI * (o.w / 2) * (o.h / 2);
  return o.w * o.h;
}

export function localPoly(o: PlanObject): V2[] {
  const base: V2[] = o.poly ?? [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
  return base.map(([x, y]) => [x * o.w, y * o.h]);
}
export const worldPoly = (o: PlanObject): V2[] => localPoly(o).map((p) => localToWorld(o, p));

export function worldAABB(o: PlanObject) {
  const pts = worldPoly(o);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

/** Build an object from absolute plot-space points (stores normalised polygon). */
export function polyFromPoints(pts: V2[]): Pick<PlanObject, "x" | "y" | "w" | "h" | "poly" | "rot"> {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = Math.max(0.2, maxX - minX), h = Math.max(0.2, maxY - minY);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  return { x: cx, y: cy, w, h, rot: 0, poly: pts.map(([x, y]) => [(x - cx) / w, (y - cy) / h] as V2) };
}

export const snapTo = (v: number, step = 0.1) => Math.round(v / step) * step;
export const uid = () => Math.random().toString(36).slice(2, 9);

export function fmtLen(m: number, units: "m" | "cm") {
  return units === "m" ? `${m.toFixed(2).replace(".", ",")} m` : `${Math.round(m * 100)} cm`;
}
export const fmtArea = (a: number) => `${a.toFixed(1).replace(".", ",")} m²`;

export function pointInPoly(p: V2, poly: V2[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
