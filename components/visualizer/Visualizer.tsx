"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MATERIALS, PATTERNS, matById } from "@/lib/catalog";
import { TILE_M, makeCanvas } from "@/lib/textures";
import type { Pattern } from "@/lib/types";

type Pt = [number, number];
interface Area { id: number; pts: Pt[]; mat: string; pattern: Pattern; size: number; rot: number }
type Mode = "mark" | "edit" | "erase";

const MAX_DIM = 1600;
interface Tex { data: Uint8ClampedArray; width: number; height: number; mU: number; mV: number }
const texCache = new Map<string, Tex>();
const photoCache = new Map<string, Tex>();
const getTex = (mat: string, pattern: Pattern): Tex => {
  const ph = photoCache.get(mat);
  if (ph) return ph;
  const key = `${mat}|${pattern}`;
  let t = texCache.get(key);
  if (!t) { const c = makeCanvas(mat, pattern); const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height); t = { data: d.data, width: d.width, height: d.height, mU: TILE_M, mV: TILE_M }; texCache.set(key, t); }
  return t;
};
/** Loads real photo textures (Poly Haven, CC0) once; falls back to procedural until they arrive. */
function loadPhotoTextures(): Promise<void> {
  return Promise.all(MATERIALS.filter((m) => m.photo && !photoCache.has(m.id)).map((m) => new Promise<void>((res) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
      const g = c.getContext("2d")!; g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height);
      photoCache.set(m.id, { data: d.data, width: d.width, height: d.height, mU: m.photo!.tileM, mV: m.photo!.tileM });
      res();
    };
    im.onerror = () => res();
    im.src = `/textures/${m.photo!.dir}/${m.photo!.dir}_diff_1k.jpg`;
  }))).then(() => undefined);
}

/** clockwise on screen, starting from the top-left-most point */
function orderQuad(p: Pt[]): Pt[] {
  const cx = p.reduce((a, q) => a + q[0], 0) / 4, cy = p.reduce((a, q) => a + q[1], 0) / 4;
  const s = [...p].sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
  let i0 = 0; s.forEach((q, i) => { if (q[0] + q[1] < s[i0][0] + s[i0][1]) i0 = i; });
  return [...s.slice(i0), ...s.slice(0, i0)];
}
function solve(A: number[][], b: number[]) {
  const n = b.length; const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
  return x;
}
function homography(src: Pt[], dst: Pt[]) {
  const A: number[][] = [], b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [X, Y] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); b.push(X);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); b.push(Y);
  }
  const h = solve(A, b);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}
function inv3(m: number[]) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((v) => v / det);
}

function sampleScene(): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = 1200; c.height = 800; const g = c.getContext("2d")!;
  const sky = g.createLinearGradient(0, 0, 0, 400); sky.addColorStop(0, "#9ec3e0"); sky.addColorStop(1, "#e9eeea"); g.fillStyle = sky; g.fillRect(0, 0, 1200, 800);
  g.fillStyle = "#6f9a54"; g.fillRect(0, 380, 1200, 420);
  g.fillStyle = "#e8e4d9"; g.fillRect(180, 190, 560, 200); g.fillStyle = "#2a2d2f"; g.fillRect(160, 172, 600, 22);
  g.fillStyle = "#3c4a55"; g.fillRect(230, 250, 200, 90); g.fillRect(500, 250, 200, 90);
  g.fillStyle = "#4b3a2c"; g.fillRect(450, 280, 40, 110);
  g.fillStyle = "#3d6b3c"; g.beginPath(); g.arc(90, 300, 110, 0, 7); g.fill(); g.beginPath(); g.arc(1110, 280, 130, 0, 7); g.fill();
  const q: Pt[] = [[520, 392], [700, 392], [1060, 790], [330, 790]];
  g.fillStyle = "#8f8c86"; g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.fill();
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${60 + (i % 5) * 20},${60 + (i % 5) * 20},${60 + (i % 5) * 20},.12)`; g.fillRect(330 + ((i * 97) % 730), 392 + ((i * 53) % 398), 3, 3); }
  return c;
}

export function Visualizer() {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [draft, setDraft] = useState<Pt[]>([]);
  const [mode, setMode] = useState<Mode>("mark");
  const [brush, setBrush] = useState(40);
  const [cmp, setCmp] = useState(0);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const photo = useRef<HTMLCanvasElement | null>(null);
  const mask = useRef<HTMLCanvasElement | null>(null);
  const out = useRef<HTMLCanvasElement>(null);
  const orig = useRef<HTMLCanvasElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const idc = useRef(1);
  const drag = useRef<{ type: "h"; i: number } | { type: "e" } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const raf = useRef(0);
  const selArea = areas.find((a) => a.id === sel) ?? null;
  const [svgW, setSvgW] = useState(800);
  useEffect(() => {
    const el = svg.current; if (!el) return;
    const ro = new ResizeObserver(() => setSvgW(el.getBoundingClientRect().width));
    ro.observe(el); setSvgW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, [dims]);
  const [matGroup, setMatGroup] = useState<string | null>(null);
  const brickMats = useMemo(() => MATERIALS.filter((m) => m.kind === "surface" || m.kind === "lawn"), []);

  const render = useCallback((preview: boolean, list: Area[]) => {
    const src = photo.current, o = out.current; if (!src || !o) return;
    const k = preview ? Math.min(1, 760 / Math.max(src.width, src.height)) : 1;
    const W = Math.round(src.width * k), H = Math.round(src.height * k);
    o.width = W; o.height = H;
    const g = o.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(src, 0, 0, W, H);
    if (!list.length) return;
    const id = g.getImageData(0, 0, W, H), d = id.data;
    let md: Uint8ClampedArray | null = null;
    if (mask.current) { const t = document.createElement("canvas"); t.width = W; t.height = H; const tg = t.getContext("2d")!; tg.drawImage(mask.current, 0, 0, W, H); md = tg.getImageData(0, 0, W, H).data; }
    for (const a of list) {
      if (a.pts.length !== 4) continue;
      const q = orderQuad(a.pts).map(([x, y]) => [x * k, y * k] as Pt);
      const dst = [...q.slice(a.rot % 4), ...q.slice(0, a.rot % 4)];
      const Wm = 4 / a.size, Dm = Wm * 1.5;
      const Hm = homography([[0, 0], [Wm, 0], [Wm, Dm], [0, Dm]], dst);
      const iv = inv3(Hm);
      const tex = getTex(a.mat, a.pattern);
      const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
      const x0 = Math.max(0, Math.floor(Math.min(...xs))), x1 = Math.min(W - 1, Math.ceil(Math.max(...xs)));
      const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(H - 1, Math.ceil(Math.max(...ys)));
      let area2 = 0; for (let i = 0; i < 4; i++) { const p = q[i], r = q[(i + 1) % 4]; area2 += p[0] * r[1] - r[0] * p[1]; }
      const sgn = area2 >= 0 ? 1 : -1;
      const inside = (x: number, y: number) => {
        for (let i = 0; i < 4; i++) { const p = q[i], r = q[(i + 1) % 4]; if (sgn * ((r[0] - p[0]) * (y - p[1]) - (r[1] - p[1]) * (x - p[0])) < 0) return false; }
        return true;
      };
      // mean luminance of the original surface
      let sum = 0, n = 0;
      for (let y = y0; y <= y1; y += 3) for (let x = x0; x <= x1; x += 3) if (inside(x + 0.5, y + 0.5)) { const p = (y * W + x) * 4; sum += 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]; n++; }
      const mean = n ? sum / n : 128;
      const offs = [0.25, 0.75];
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        let r = 0, gg = 0, b = 0, cnt = 0;
        for (const oy of offs) for (const ox of offs) {
          const sx = x + ox, sy = y + oy;
          if (!inside(sx, sy)) continue;
          const w = iv[6] * sx + iv[7] * sy + iv[8]; if (w <= 0) continue;
          const u = (iv[0] * sx + iv[1] * sy + iv[2]) / w, v = (iv[3] * sx + iv[4] * sy + iv[5]) / w;
          const tx = Math.floor((((u % tex.mU) + tex.mU) % tex.mU) / tex.mU * tex.width) % tex.width;
          const ty = Math.floor((((v % tex.mV) + tex.mV) % tex.mV) / tex.mV * tex.height) % tex.height;
          const tp = (ty * tex.width + tx) * 4;
          r += tex.data[tp]; gg += tex.data[tp + 1]; b += tex.data[tp + 2]; cnt++;
        }
        if (!cnt) continue;
        const p = (y * W + x) * 4;
        let cov = cnt / 4;
        if (md) cov *= 1 - md[p + 3] / 255;
        if (cov <= 0) continue;
        const lum = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
        let shade = Math.max(0.55, Math.min(1.5, lum / mean)); shade = 1 + (shade - 1) * 0.9;
        const m = cov * 0.97;
        d[p] = d[p] * (1 - m) + Math.min(255, (r / cnt) * shade) * m;
        d[p + 1] = d[p + 1] * (1 - m) + Math.min(255, (gg / cnt) * shade) * m;
        d[p + 2] = d[p + 2] * (1 - m) + Math.min(255, (b / cnt) * shade) * m;
      }
    }
    g.putImageData(id, 0, 0);
  }, []);

  const schedule = useCallback((list: Area[]) => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => render(true, list));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => render(false, list), 280);
  }, [render]);

  const groupOf = (cat: string) => (cat.startsWith("Kostka") ? "Kostka" : cat === "Trawnik" ? "Trawnik" : cat === "Żwir" ? "Żwir" : "Płyty i kamień");
  const matGroups = useMemo(() => ["Kostka", "Płyty i kamień", "Żwir", "Trawnik"].filter((g) => brickMats.some((m) => groupOf(m.cat) === g)), [brickMats]); // eslint-disable-line react-hooks/exhaustive-deps
  const activeGroup = matGroup ?? groupOf(matById(selArea?.mat).cat);
  const [texVer, setTexVer] = useState(0);
  useEffect(() => { loadPhotoTextures().then(() => setTexVer((v) => v + 1)); }, []);
  useEffect(() => { schedule(areas); }, [areas, dims, schedule, texVer]);

  const load = (c: HTMLCanvasElement) => {
    photo.current = c;
    const m = document.createElement("canvas"); m.width = c.width; m.height = c.height; mask.current = m;
    setDims({ w: c.width, h: c.height }); setAreas([]); setSel(null); setDraft([]); setMode("mark"); setCmp(0);
    requestAnimationFrame(() => { const o = orig.current; if (o) { o.width = c.width; o.height = c.height; o.getContext("2d")!.drawImage(c, 0, 0); } });
  };
  const onFile = (f?: File) => {
    if (!f) return; setErr(""); setBusy(true);
    const url = URL.createObjectURL(f); const im = new Image();
    im.onload = () => {
      const s = Math.min(1, MAX_DIM / Math.max(im.width, im.height));
      const c = document.createElement("canvas"); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      c.getContext("2d")!.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); setBusy(false); load(c);
    };
    im.onerror = () => { setBusy(false); setErr("Nie udało się odczytać zdjęcia. Użyj formatu JPG lub PNG (zdjęcia HEIC z iPhone'a najpierw zapisz jako JPG)."); };
    im.src = url;
  };

  const loadUrl = (url: string) => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, MAX_DIM / Math.max(im.width, im.height));
      const c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext("2d")!.drawImage(im, 0, 0, c.width, c.height); load(c);
    };
    im.src = url;
  };
  const pos = (e: React.PointerEvent): Pt => {
    const r = svg.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * dims!.w, ((e.clientY - r.top) / r.height) * dims!.h];
  };
  const paint = (p: Pt) => {
    const m = mask.current!, g = m.getContext("2d")!;
    const rad = brush * (dims!.w / 1000);
    const gr = g.createRadialGradient(p[0], p[1], rad * 0.35, p[0], p[1], rad);
    gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(p[0], p[1], rad, 0, 7); g.fill();
    cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(() => render(true, areas));
  };
  const down = (e: React.PointerEvent) => {
    if (!dims) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = pos(e);
    if (mode === "erase") { drag.current = { type: "e" }; paint(p); return; }
    if (mode === "mark") {
      const nd = [...draft, p];
      if (nd.length === 4) {
        const id = idc.current++;
        const base = selArea ?? { mat: "kb-grafit", pattern: "classic" as Pattern, size: 1 };
        setAreas((a) => [...a, { id, pts: nd, mat: base.mat, pattern: base.pattern, size: base.size, rot: 0 }]);
        setSel(id); setDraft([]); setMode("edit");
      } else setDraft(nd);
      return;
    }
    const h = (e.target as Element).getAttribute("data-h");
    if (h !== null) drag.current = { type: "h", i: Number(h) };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || !dims) return;
    const p = pos(e);
    if (d.type === "e") paint(p);
    else setAreas((as) => as.map((a) => (a.id === sel ? { ...a, pts: a.pts.map((q, i) => (i === d.i ? [Math.max(0, Math.min(dims.w, p[0])), Math.max(0, Math.min(dims.h, p[1]))] as Pt : q)) } : a)));
  };
  const up = () => { if (drag.current?.type === "e") { clearTimeout(timer.current); timer.current = setTimeout(() => render(false, areas), 50); } drag.current = null; };

  const patch = (p: Partial<Area>) => sel !== null && setAreas((as) => as.map((a) => (a.id === sel ? { ...a, ...p } : a)));
  const download = () => {
    render(false, areas);
    out.current!.toBlob((b) => { if (!b) return; const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "wizualizacja-kostki.png"; a.click(); }, "image/png");
  };
  const clearMask = () => { const m = mask.current; if (m) { m.getContext("2d")!.clearRect(0, 0, m.width, m.height); render(false, areas); } };
  const r = dims ? Math.max(dims.w / 90, (16 * dims.w) / Math.max(svgW, 200)) : 10;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        {!dims ? (
          <div className="grid min-h-[420px] place-items-center border border-dashed border-[var(--color-ink)] bg-[var(--color-paper)] p-8 text-center"
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
            <div className="max-w-md">
              <p className="h2">wgraj zdjęcie swojego podjazdu lub ogrodu.</p>
              <p className="prose-m mx-auto mt-3 text-[var(--color-ink-2)]">Najlepiej zdjęcie zrobione z chodnika lub z okna, tak żeby było widać całą powierzchnię. Zdjęcie zostaje w Twojej przeglądarce — nigdzie go nie wysyłamy.</p>
              <label className="btn btn-dark mt-6 cursor-pointer">Wybierz zdjęcie<input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} /></label>
              <button className="mt-4 block min-h-[44px] w-full text-sm underline" onClick={() => load(sampleScene())}>Wypróbuj na ilustracji przykładowej</button>
              {busy && <p className="mt-3 text-sm">Wczytuję…</p>}
              {err && <p role="alert" className="mt-3 text-sm text-[var(--color-error)]">{err}</p>}
            </div>
          </div>
        ) : (
          <div>
            <div className="relative w-full select-none overflow-hidden bg-[var(--color-ink)]" style={{ aspectRatio: `${dims.w}/${dims.h}`, touchAction: mode === "mark" ? "pan-y" : "none" }}>
              <canvas ref={orig} className="absolute inset-0 h-full w-full" role="img" aria-label="Twoje zdjęcie przed zmianą" />
              <canvas ref={out} className="absolute inset-0 h-full w-full" role="img" aria-label="Twoje zdjęcie z wybraną kostką" style={{ clipPath: `inset(0 0 0 ${cmp}%)` }} />
              {cmp > 0 && <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-[var(--color-accent)]" style={{ left: `${cmp}%` }} />}
              <svg ref={svg} role="application" aria-label="Zaznaczanie nawierzchni na zdjęciu: kliknij cztery rogi" viewBox={`0 0 ${dims.w} ${dims.h}`} className="absolute inset-0 h-full w-full" style={{ cursor: mode === "edit" ? "default" : "crosshair" }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
                {mode === "edit" && selArea && (
                  <g>
                    <polygon points={selArea.pts.map((p) => p.join(",")).join(" ")} fill="none" className="vz-dash" strokeWidth={r / 4} strokeDasharray={`${r} ${r / 2}`} pointerEvents="none" />
                    {selArea.pts.map((p, i) => <circle key={i} data-h={i} cx={p[0]} cy={p[1]} r={r * 0.9} className="vz-handle" strokeWidth={r / 5} style={{ cursor: "grab", touchAction: "none" }} />)}
                  </g>
                )}
                {mode === "mark" && (
                  <g pointerEvents="none">
                    {draft.length > 1 && <polyline points={draft.map((p) => p.join(",")).join(" ")} className="vz-line" strokeWidth={r / 4} />}
                    {draft.map((p, i) => <g key={i}><circle cx={p[0]} cy={p[1]} r={r * 0.9} className="vz-handle" strokeWidth={r / 5} /><text x={p[0]} y={p[1] + r * 0.35} textAnchor="middle" fontSize={r} fontWeight={700} className="vz-num">{i + 1}</text></g>)}
                  </g>
                )}
              </svg>
              {mode === "mark" && <div className="pointer-events-none absolute left-3 top-3 bg-[var(--color-ink)] px-3 py-2 text-sm text-[var(--color-paper)]">Kliknij 4 rogi nawierzchni ({draft.length}/4)</div>}
              {mode === "erase" && <div className="pointer-events-none absolute left-3 top-3 bg-[var(--color-ink)] px-3 py-2 text-sm text-[var(--color-paper)]">Zamaluj samochód, krzak lub inne rzeczy, które mają zostać na wierzchu</div>}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="label flex items-center gap-2">przed
                <input type="range" min={0} max={95} value={cmp} onChange={(e) => setCmp(Number(e.target.value))} aria-label="Porównanie przed i po" />po</label>
              <button className="btn btn-dark !py-2.5" onClick={download}>Pobierz obraz</button>
              <button className="min-h-[44px] text-sm underline" onClick={() => { setDims(null); photo.current = null; }}>Inne zdjęcie</button>
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <section>
          <h2 className="h3">1. zaznacz nawierzchnię.</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-2)]">Kliknij cztery rogi miejsca, które ma być wyłożone kostką albo zazielenione. Rogi możesz potem przeciągać.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button disabled={!dims} className="btn btn-line !px-3 !py-2" onClick={() => { setMode("mark"); setDraft([]); }}>+ Nowy obszar</button>
            <button disabled={!dims} className={`btn !px-3 !py-2 ${mode === "erase" ? "btn-dark" : "btn-line"}`} onClick={() => setMode(mode === "erase" ? "edit" : "erase")}>Gumka</button>
            {areas.length > 0 && <button className="btn btn-line !px-3 !py-2" onClick={() => { setAreas((a) => a.filter((x) => x.id !== sel)); setSel(null); }}>Usuń obszar</button>}
          </div>
          {mode === "erase" && (
            <div className="mt-3 space-y-2 text-sm">
              <label className="flex items-center gap-2">Grubość <input type="range" min={10} max={120} value={brush} onChange={(e) => setBrush(Number(e.target.value))} /></label>
              <button className="underline" onClick={clearMask}>Cofnij całe zamalowanie</button>
            </div>
          )}
          {areas.length > 1 && (
            <div className="mt-3 flex gap-1.5">{areas.map((a, i) => <button key={a.id} onClick={() => { setSel(a.id); setMode("edit"); }} className={`min-h-[44px] border px-3 text-sm ${sel === a.id ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]" : "border-[var(--color-rule)]"}`}>Obszar {i + 1}</button>)}</div>
          )}
        </section>

        {selArea ? (
          <section>
            <h2 className="h3">2. wybierz kostkę lub trawnik.</h2>
            <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Rodzaj materiału">
              {matGroups.map((g) => (
                <button key={g} role="tab" aria-selected={activeGroup === g} onClick={() => setMatGroup(g)} className={`min-h-[44px] border px-3 text-sm ${activeGroup === g ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]" : "border-[var(--color-rule)]"}`}>{g}</button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {brickMats.filter((m) => groupOf(m.cat) === activeGroup).map((m) => (
                <button key={m.id} title={m.name} onClick={() => patch({ mat: m.id, pattern: m.pattern ?? "classic" })} aria-pressed={selArea.mat === m.id} aria-label={m.name} className={`border-2 text-left ${selArea.mat === m.id ? "border-[var(--color-ink)]" : "border-transparent hover:border-[var(--color-ink)]"}`}>
                  <span className="block aspect-square w-full" style={{ backgroundImage: m.photo ? `url(/textures/${m.photo.dir}/${m.photo.dir}_diff_1k.jpg)` : `url(${makeCanvas(m.id, m.pattern).toDataURL()})`, backgroundSize: m.photo ? "170%" : "220%" }} />
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm">{matById(selArea.mat).name}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
              {matById(selArea.mat).tex === "bricks" && !matById(selArea.mat).photo && (
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Układ">{PATTERNS.map((p) => <button key={p.id} role="radio" aria-checked={selArea.pattern === p.id} onClick={() => patch({ pattern: p.id })} className={`min-h-[44px] border px-3 text-sm ${selArea.pattern === p.id ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]" : "border-[var(--color-rule)]"}`}>{p.name}</button>)}</div>
              )}
              <label className="flex min-w-[10rem] flex-1 items-center gap-2 text-sm"><span>Wielkość</span>
                <input type="range" min={0.5} max={2} step={0.05} value={selArea.size} onChange={(e) => patch({ size: Number(e.target.value) })} className="w-full" aria-label="Wielkość kostki" /></label>
              <button className="inline-flex min-h-[44px] items-center text-sm underline" onClick={() => patch({ rot: (selArea.rot + 1) % 4 })}>Obróć wzór</button>
            </div>
          </section>
        ) : (
          <p className="text-sm text-[var(--color-ink-2)]">2. wybór kostki lub trawnika pojawi się tutaj po zaznaczeniu obszaru.</p>
        )}
        <p className="label">Wizualizacja jest poglądowa — rzeczywisty kolor kostki zależy od partii i oświetlenia.</p>
      </aside>
    </div>
  );
}
