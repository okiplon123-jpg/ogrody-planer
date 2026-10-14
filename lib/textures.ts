import type { Pattern } from "./types";
import { matById } from "./catalog";

/** Procedural material textures (client only). One tile = TILE_M metres. Swap for real product textures later. */
export const TILE_M = 1.2;
const PX = 480;
const cache = new Map<string, HTMLCanvasElement>();
const urlCache = new Map<string, string>();

function hash(a: number, b: number) {
  let h = Math.imul(a + 374761393, 668265263) ^ Math.imul(b + 1274126177, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

export function makeCanvas(matId: string, pattern?: Pattern): HTMLCanvasElement {
  const m = matById(matId);
  const pat = m.tex === "bricks" ? pattern ?? m.pattern ?? "classic" : "none";
  const key = `${m.id}|${pat}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = cv.height = PX;
  const g = cv.getContext("2d")!;
  const s = PX / TILE_M / 100; // px per cm
  const joint = shade(m.color, 0.45);

  if (m.tex === "bricks") {
    g.fillStyle = joint; g.fillRect(0, 0, PX, PX);
    const block = (x: number, y: number, w: number, h: number, id: number) => {
      g.fillStyle = shade(m.color, 0.88 + hash(id, 7) * 0.24);
      g.fillRect(x * s + 1, y * s + 1, w * s - 2, h * s - 2);
    };
    let id = 0;
    if (pat === "classic") {
      for (let r = 0; r < 12; r++) for (let c = -1; c < 7; c++) block(c * 20 + (r % 2) * 10, r * 10, 20, 10, id++);
    } else if (pat === "rect") {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) block(c * 30, r * 30, 30, 30, id++);
    } else if (pat === "herringbone") {
      const W = 10; // cell cm → bricks 10x20
      const n = 12;
      for (let a = -2; a < n + 2; a++) for (let b = -2; b < n + 2; b++) {
        const k = (((a + b) % 4) + 4) % 4;
        const ox = ((a % n) + n) % n, oy = ((b % n) + n) % n;
        if (k === 0) { block(a * W, b * W, 2 * W, W, ox * 13 + oy); }
        else if (k === 2) { block(a * W, b * W, W, 2 * W, ox * 13 + oy + 99); }
      }
    } else {
      // modern: 60x120 slabs, columns offset by half
      for (let c = 0; c < 2; c++) for (let r = -1; r < 2; r++) block(c * 60, r * 120 + (c % 2) * 60, 60, 120, c * 5 + r + 20);
    }
  } else if (m.tex === "gravel") {
    g.fillStyle = shade(m.color, 0.8); g.fillRect(0, 0, PX, PX);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = shade(m.color, 0.7 + hash(i, 3) * 0.55);
      g.beginPath(); g.arc(hash(i, 1) * PX, hash(i, 2) * PX, 1.2 + hash(i, 4) * 2.4, 0, 7); g.fill();
    }
  } else if (m.tex === "grass") {
    g.fillStyle = shade(m.color, 0.95); g.fillRect(0, 0, PX, PX);
    for (let i = 0; i < 5000; i++) {
      g.strokeStyle = shade(m.color, 0.75 + hash(i, 5) * 0.5); g.lineWidth = 1;
      const x = hash(i, 1) * PX, y = hash(i, 2) * PX;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (hash(i, 3) - 0.5) * 5, y - 3 - hash(i, 4) * 5); g.stroke();
    }
  } else if (m.tex === "mulch") {
    g.fillStyle = shade(m.color, 0.85); g.fillRect(0, 0, PX, PX);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = shade(m.color, 0.6 + hash(i, 5) * 0.7);
      g.save(); g.translate(hash(i, 1) * PX, hash(i, 2) * PX); g.rotate(hash(i, 3) * 6.3);
      g.fillRect(0, 0, 5 + hash(i, 4) * 12, 2 + hash(i, 6) * 3); g.restore();
    }
  } else {
    g.fillStyle = joint; g.fillRect(0, 0, PX, PX);
    for (let c = 0; c < 8; c++) for (let r = 0; r < 3; r++) {
      g.fillStyle = shade(m.color, 0.88 + hash(c, r) * 0.24);
      g.fillRect(c * 15 * s + 1, (r * 40 + ((c * 17) % 40)) * s % PX + 1, 15 * s - 2, 40 * s - 2);
    }
  }
  cache.set(key, cv);
  return cv;
}

export function textureUrl(matId: string, pattern?: Pattern): string {
  const m = matById(matId);
  const key = `${m.id}|${pattern ?? m.pattern ?? ""}`;
  let u = urlCache.get(key);
  if (!u) { u = makeCanvas(matId, pattern).toDataURL("image/png"); urlCache.set(key, u); }
  return u;
}
