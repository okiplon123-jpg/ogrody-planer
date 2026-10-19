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

/* ---------- editable, curved shapes ---------- */
const lerp2 = (a: V2, b: V2, t: number): V2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Catmull-Rom through the points. closed = loop. Dense output, ready to render as a polygon. */
export function smoothCurve(pts: V2[], closed: boolean, seg = 10): V2[] {
  const n = pts.length;
  if (n < 3) return pts;
  const at = (i: number): V2 => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const out: V2[] = [];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let k = 0; k < seg; k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

/** A strip of the given width along a centre line, with rounded ends. */
export function bandPolygon(line: V2[], width: number): V2[] {
  const hw = width / 2, n = line.length;
  if (n < 2) return line;
  const left: V2[] = [], right: V2[] = [];
  for (let i = 0; i < n; i++) {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    left.push([line[i][0] - dy * hw, line[i][1] + dx * hw]);
    right.push([line[i][0] + dy * hw, line[i][1] - dx * hw]);
  }
  const cap = (c: V2, d: V2, flip: number): V2[] => {
    const out: V2[] = [];
    const a0 = Math.atan2(d[1], d[0]) - (Math.PI / 2) * flip;
    for (let k = 1; k < 6; k++) { const a = a0 + (Math.PI * k * flip) / 6; out.push([c[0] + Math.cos(a) * hw, c[1] + Math.sin(a) * hw]); }
    return out;
  };
  const dEnd: V2 = [line[n - 1][0] - line[n - 2][0], line[n - 1][1] - line[n - 2][1]];
  const dStart: V2 = [line[0][0] - line[1][0], line[0][1] - line[1][1]];
  return [...left, ...cap(line[n - 1], dEnd, 1), ...right.reverse(), ...cap(line[0], dStart, 1)];
}

export function shapePoints(nodes: V2[], smooth: boolean, band?: number): V2[] {
  if (band) return bandPolygon(smooth && nodes.length > 2 ? smoothCurve(nodes, false, 12) : nodes, band);
  return smooth && nodes.length > 2 ? smoothCurve(nodes, true, 10) : nodes;
}

/** Control points of a shape in local metres (derived from the polygon for shapes made before nodes existed). */
export function getNodes(o: PlanObject): V2[] {
  if (o.nodes?.length) return o.nodes;
  const base: V2[] = o.poly ?? [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
  return base.map(([x, y]) => [x * o.w, y * o.h] as V2);
}

/** Re-derive polygon + bounding box from new local nodes; keeps the object in place on the plan. */
export function rebuildShape(o: PlanObject, localNodes: V2[]): Partial<PlanObject> {
  const pts = shapePoints(localNodes, !!o.smooth, o.band);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = Math.max(0.2, maxX - minX), h = Math.max(0.2, maxY - minY);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const wc = localToWorld(o, [cx, cy]);
  return {
    x: wc[0], y: wc[1], w, h,
    nodes: localNodes.map(([x, y]) => [x - cx, y - cy] as V2),
    poly: pts.map(([x, y]) => [(x - cx) / w, (y - cy) / h] as V2),
  };
}

/** A new shape from points in plan coordinates. */
export function shapeFromWorld(worldNodes: V2[], smooth: boolean, band?: number): Pick<PlanObject, "x" | "y" | "w" | "h" | "rot" | "poly" | "nodes" | "smooth" | "band"> {
  const tmp = { id: "", kind: "surface", x: 0, y: 0, w: 1, h: 1, rot: 0, smooth, band } as PlanObject;
  const patch = rebuildShape(tmp, worldNodes) as Required<Pick<PlanObject, "x" | "y" | "w" | "h" | "poly" | "nodes">>;
  return { ...patch, rot: 0, smooth, band };
}

/** Ramer–Douglas–Peucker simplification (for freehand strokes). */
export function simplify(pts: V2[], eps: number): V2[] {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let dmax = 0, idx = 0;
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1e-9;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax <= eps) return [a, b];
  return [...simplify(pts.slice(0, idx + 1), eps).slice(0, -1), ...simplify(pts.slice(idx), eps)];
}

export function nearestSegment(nodes: V2[], p: V2, closed: boolean): { index: number; t: number; dist: number } {
  let best = { index: 0, t: 0.5, dist: Infinity };
  const n = nodes.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = nodes[i], b = nodes[(i + 1) % n];
    const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1e-9;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
    const d = Math.hypot(p[0] - (a[0] + dx * t), p[1] - (a[1] + dy * t));
    if (d < best.dist) best = { index: i, t, dist: d };
  }
  return best;
}
export { lerp2 };

/** Simplify a stroke that will be closed into a shape (splits at the point farthest from the start so a loop does not collapse). */
export function simplifyClosed(pts: V2[], eps: number): V2[] {
  if (pts.length < 4) return pts;
  let m = 0, dm = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]); if (d > dm) { dm = d; m = i; } }
  const a = simplify(pts.slice(0, m + 1), eps), b = simplify(pts.slice(m), eps);
  const out = [...a, ...b.slice(1)];
  const f = out[0], l = out[out.length - 1];
  if (out.length > 3 && Math.hypot(f[0] - l[0], f[1] - l[1]) < eps * 2) out.pop();
  return out;
}
