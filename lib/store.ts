"use client";
import { create } from "zustand";
import type { Edging, Lighting, Pattern, PlanObject, Project, Settings, SurfaceUse } from "./types";
import { emptyProject, sampleProject } from "./sample";
import { LibItem, SHAPE_KINDS, SPECIES, matById } from "./catalog";

export type DrawMode = "points" | "free" | "band";
export type DrawTarget = "driveway" | "terrace" | "path" | "lawn" | "bed";
export const DRAW_TARGETS: Record<DrawTarget, { name: string; kind: "surface" | "lawn" | "bed"; use?: SurfaceUse; width: number; smooth: boolean }> = {
  driveway: { name: "Podjazd", kind: "surface", use: "driveway", width: 3.5, smooth: false },
  terrace: { name: "Taras", kind: "surface", use: "terrace", width: 3, smooth: false },
  path: { name: "Ścieżka", kind: "surface", use: "path", width: 1.2, smooth: true },
  lawn: { name: "Trawnik", kind: "lawn", width: 3, smooth: true },
  bed: { name: "Rabata", kind: "bed", width: 1.4, smooth: true },
};
import { getNodes, polyArea, rebuildShape, shapeFromWorld, uid, worldAABB, type V2 } from "./geometry";

const KEY = "ogrody-planer:project";
export type ViewPreset = "perspective" | "top" | "eye";
export type PanelId = "plot" | "buildings" | "surfaces" | "garden" | "preview" | "settings";

interface State {
  project: Project; past: Project[]; future: Project[];
  selectedId: string | null;
  mode: "2d" | "3d"; view3d: ViewPreset; cameraNonce: number;
  tool: "select" | "draw"; drawPts: V2[]; drawMode: DrawMode; drawTarget: DrawTarget; drawSmooth: boolean; drawWidth: number;
  armed: LibItem | null; multi: boolean;
  defMaterial: string; defPattern: Pattern; defEdging: Edging;
  settings: Settings;
  panel: PanelId; panelOpen: boolean; welcome: boolean; summaryOpen: boolean;
  preview3d: string | null; savedAt: number | null; toast: string | null;
  viewCenter: V2; fitNonce: number;
  commit: () => void;
  setProject: (p: Project) => void;
  patchProject: (patch: Partial<Project>, record?: boolean) => void;
  setPlot: (w: number, l: number) => void;
  addObject: (o: Omit<PlanObject, "id">) => string;
  update: (id: string, patch: Partial<PlanObject>, record?: boolean) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  undo: () => void; redo: () => void;
  select: (id: string | null) => void;
  addFromLib: (item: LibItem, at?: V2) => void;
  startDraw: () => void; setDraw: (p: Partial<{ drawMode: DrawMode; drawSmooth: boolean; drawWidth: number }>) => void; setDrawTarget: (t: DrawTarget) => void;
  addDrawPt: (p: V2) => void; undoDrawPt: () => void; finishDraw: (pts?: V2[]) => void; cancelDraw: () => void;
  reshape: (id: string, p: { smooth?: boolean; band?: number }) => void;
  applyMaterial: (id: string) => void; applyPattern: (p: Pattern) => void; applyEdging: (e: Edging) => void;
  set: (patch: Partial<State>) => void;
  setSettings: (p: Partial<Settings>) => void;
  notify: (msg: string) => void;
  save: () => void; load: () => boolean; loadSample: () => void; newProject: (w: number, l: number) => void;
}

function presetShape(item: LibItem, cx: number, cy: number) {
  const w = item.w, h = item.h, sh = item.shape ?? "rect";
  let nodes: V2[] = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  let smooth = false, band: number | undefined;
  if (sh === "blob") { smooth = true; nodes = [1, 0.84, 1.06, 0.9, 1.02, 0.86].map((r, k) => { const a = (k / 6) * Math.PI * 2; return [Math.cos(a) * (w / 2) * r, Math.sin(a) * (h / 2) * r] as V2; }); }
  if (sh === "curve") { smooth = true; band = h; nodes = [[-w / 2, 0], [-w / 6, -0.9], [w / 6, 0.9], [w / 2, 0]]; }
  return shapeFromWorld(nodes.map(([x, y]) => [x + cx, y + cy] as V2), smooth, band);
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useStore = create<State>((set, get) => ({
  project: emptyProject(20, 30), past: [], future: [],
  selectedId: null, mode: "2d", view3d: "perspective", cameraNonce: 0,
  tool: "select", drawPts: [], drawMode: "band", drawTarget: "path", drawSmooth: true, drawWidth: 1.2,
  armed: null, multi: false,
  defMaterial: "kb-grafit", defPattern: "classic", defEdging: "none",
  settings: { units: "m", snap: true, grid: true, dims: true, waste: 8, quality: "high" },
  panel: "plot", panelOpen: true, welcome: false, summaryOpen: false,
  preview3d: null, savedAt: null, toast: null, viewCenter: [11, 18], fitNonce: 0,

  commit: () => set((s) => ({ past: [...s.past.slice(-99), s.project], future: [] })),
  setProject: (p) => set({ project: p, past: [], future: [], selectedId: null, preview3d: null, fitNonce: get().fitNonce + 1 }),
  patchProject: (patch, record = true) => {
    if (record) get().commit();
    set((s) => ({ project: { ...s.project, ...patch } }));
  },
  setPlot: (w, l) => {
    get().commit();
    set((s) => ({ project: { ...s.project, plot: { w: Math.max(5, Math.min(120, w)), l: Math.max(5, Math.min(120, l)) } }, fitNonce: s.fitNonce + 1 }));
  },
  addObject: (o) => {
    const id = uid();
    get().commit();
    set((s) => ({ project: { ...s.project, objects: [...s.project.objects, { ...o, id }] }, selectedId: id }));
    return id;
  },
  update: (id, patch, record = true) => {
    if (record) get().commit();
    set((s) => ({ project: { ...s.project, objects: s.project.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)) } }));
  },
  remove: (id) => {
    get().commit();
    set((s) => ({ project: { ...s.project, objects: s.project.objects.filter((o) => o.id !== id) }, selectedId: s.selectedId === id ? null : s.selectedId }));
  },
  duplicate: (id) => {
    const o = get().project.objects.find((x) => x.id === id);
    if (o) get().addObject({ ...o, x: o.x + 0.8, y: o.y + 0.8 });
  },
  undo: () => set((s) => {
    if (!s.past.length) return s;
    const prev = s.past[s.past.length - 1];
    return { project: prev, past: s.past.slice(0, -1), future: [s.project, ...s.future], selectedId: prev.objects.some((o) => o.id === s.selectedId) ? s.selectedId : null };
  }),
  redo: () => set((s) => {
    if (!s.future.length) return s;
    const [next, ...rest] = s.future;
    return { project: next, future: rest, past: [...s.past, s.project] };
  }),
  select: (id) => set({ selectedId: id }),

  addFromLib: (item, at) => {
    const s = get();
    let [cx, cy] = at ?? s.viewCenter;
    if (!at && SHAPE_KINDS.includes(item.kind)) {
      // ground shapes: look for a spot that is not under a building
      const blockers = s.project.objects.filter((o) => o.kind === "house" || o.kind === "garage").map(worldAABB);
      const hit = (x: number, y: number) => blockers.some((b) => x + item.w / 2 > b.minX && x - item.w / 2 < b.maxX && y + item.h / 2 > b.minY && y - item.h / 2 < b.maxY);
      const { w: pw, l: pl } = s.project.plot;
      search: for (let ring = 0; ring < 14; ring++) {
        for (let k = 0; k < Math.max(1, ring * 8); k++) {
          const a = (k / Math.max(1, ring * 8)) * Math.PI * 2, d = ring * 2.5;
          const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
          if (x - item.w / 2 > 0 && x + item.w / 2 < pw && y - item.h / 2 > 0 && y + item.h / 2 < pl && !hit(x, y)) { cx = x; cy = y; break search; }
        }
      }
    }
    const n = item.group ?? 1;
    const base: Omit<PlanObject, "id" | "x" | "y"> = {
      kind: item.kind, w: item.w, h: item.h, rot: 0, species: item.species, height: item.height,
      material: item.material, facade: item.kind === "house" || item.kind === "garage" ? "white" : undefined,
      pattern: item.pattern, use: item.use,
    };
    get().commit();
    let last = "";
    const added: PlanObject[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, r = n > 1 ? item.w * 0.9 : 0;
      const jit = n > 1 ? (((i * 37) % 10) / 10 - 0.5) * 0.3 : 0;
      const id = uid(); last = id;
      added.push({ ...base, id, x: cx + Math.cos(a) * r + jit, y: cy + Math.sin(a) * r + jit, w: base.w * (1 + (n > 1 ? (((i * 53) % 7) - 3) * 0.04 : 0)), h: base.h });
    }
    added.forEach((o) => { if (SHAPE_KINDS.includes(o.kind)) Object.assign(o, presetShape(item, cx, cy)); if (o.w !== o.h && ["tree", "shrub", "grass", "planter"].includes(o.kind)) o.h = o.w; });
    set((st) => ({ project: { ...st.project, objects: [...st.project.objects, ...added] }, selectedId: last, viewCenter: [cx + 0.9, cy + 0.9] }));
  },

  startDraw: () => set({ tool: "draw", drawPts: [], armed: null, selectedId: null, mode: "2d" }),
  setDraw: (p) => set(p as Partial<State>),
  setDrawTarget: (t) => set({ drawTarget: t, drawWidth: DRAW_TARGETS[t].width, drawSmooth: DRAW_TARGETS[t].smooth, drawMode: get().drawMode === "free" ? "free" : t === "path" ? "band" : "points" }),
  addDrawPt: (p) => set((st) => ({ drawPts: [...st.drawPts, p] })),
  undoDrawPt: () => set((st) => ({ drawPts: st.drawPts.slice(0, -1) })),
  finishDraw: (override) => {
    const st = get();
    const raw = override ?? st.drawPts;
    const pts = raw.filter((p, i) => i === 0 || Math.hypot(p[0] - raw[i - 1][0], p[1] - raw[i - 1][1]) > 0.05);
    const band = st.drawMode === "band";
    if (pts.length < (band ? 2 : 3)) { set({ tool: "select", drawPts: [] }); return; }
    const t = DRAW_TARGETS[st.drawTarget];
    const shape = shapeFromWorld(pts, st.drawSmooth, band ? st.drawWidth : undefined);
    const area = polyArea(shape.poly ?? []) * shape.w * shape.h;
    if (area < 0.4) {
      set({ drawPts: [] });
      get().notify(band ? "Ścieżka jest za krótka. Kliknij co najmniej dwa punkty daleko od siebie." : "Obrys jest za mały albo prosty. Narysuj większy kształt (obrys musi coś obejmować).");
      return;
    }
    const material = t.kind === "lawn" ? "tr-rolowany" : t.kind === "bed" ? "rb-kora" : st.defMaterial;
    const id = get().addObject({
      kind: t.kind, ...shape,
      material, pattern: st.defPattern, edging: st.defEdging, use: t.use,
    });
    set({ tool: "select", drawPts: [], selectedId: id });
  },
  cancelDraw: () => set({ tool: "select", drawPts: [] }),
  reshape: (id, p) => {
    get().commit();
    set((st) => ({ project: { ...st.project, objects: st.project.objects.map((o) => { if (o.id !== id) return o; const o2 = { ...o, ...p }; return { ...o2, ...rebuildShape(o2, getNodes(o)) }; }) } }));
  },

  applyMaterial: (id) => {
    const s = get(); const m = matById(id);
    const sel = s.project.objects.find((o) => o.id === s.selectedId);
    if (sel && sel.kind === m.kind) s.update(sel.id, { material: id, pattern: m.pattern ?? sel.pattern });
    else if (!sel || sel.kind !== m.kind) {
      set({ defMaterial: m.kind === "surface" ? id : s.defMaterial, defPattern: m.pattern ?? s.defPattern });
      if (sel) s.notify(`Zaznaczony obiekt to „${sel.kind === "surface" ? "nawierzchnia" : sel.kind}” — wybierz pasujący materiał.`);
      else s.notify(m.kind === "surface" ? "Ustawiono materiał dla nowych nawierzchni. Zaznacz obszar, aby go zmienić." : "Zaznacz trawnik lub rabatę, aby zmienić materiał.");
    }
  },
  applyPattern: (p) => {
    const s = get(); const sel = s.project.objects.find((o) => o.id === s.selectedId);
    if (sel?.kind === "surface") s.update(sel.id, { pattern: p }); else set({ defPattern: p });
  },
  applyEdging: (e) => {
    const s = get(); const sel = s.project.objects.find((o) => o.id === s.selectedId);
    if (sel?.kind === "surface") s.update(sel.id, { edging: e }); else set({ defEdging: e });
  },

  set: (patch) => set(patch as Partial<State>),
  setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
  notify: (msg) => {
    clearTimeout(toastTimer);
    set({ toast: msg });
    toastTimer = setTimeout(() => set({ toast: null }), 3600);
  },

  save: () => {
    try {
      const savedAt = Date.now();
      localStorage.setItem(KEY, JSON.stringify({ version: 1, savedAt, project: get().project }));
      set({ savedAt });
      get().notify("Projekt zapisany lokalnie w tej przeglądarce (tryb demonstracyjny — bez konta i serwera).");
    } catch { get().notify("Nie udało się zapisać projektu (zablokowany localStorage)."); }
  },
  load: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (d.version !== 1 || !d.project?.objects) return false;
      get().setProject(d.project);
      set({ savedAt: d.savedAt });
      return true;
    } catch { return false; }
  },
  loadSample: () => { get().setProject(sampleProject()); set({ welcome: false, mode: "2d" }); },
  newProject: (w, l) => { get().setProject(emptyProject(w, l)); set({ welcome: false, mode: "2d", panel: "buildings", panelOpen: true }); },
}));

export const hasSaved = () => { try { return !!localStorage.getItem(KEY); } catch { return false; } };
export { SPECIES };
export type { Lighting };
