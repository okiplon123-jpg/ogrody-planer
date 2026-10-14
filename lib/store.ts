"use client";
import { create } from "zustand";
import type { Edging, Lighting, Pattern, PlanObject, Project, Settings, SurfaceUse } from "./types";
import { emptyProject, sampleProject } from "./sample";
import { LibItem, SPECIES, matById } from "./catalog";
import { polyFromPoints, uid, type V2 } from "./geometry";

const KEY = "ogrody-planer:project";
export type ViewPreset = "perspective" | "top" | "eye";
export type PanelId = "plot" | "buildings" | "surfaces" | "garden" | "preview" | "settings";

interface State {
  project: Project; past: Project[]; future: Project[];
  selectedId: string | null;
  mode: "2d" | "3d"; view3d: ViewPreset; cameraNonce: number;
  tool: "select" | "draw"; drawPts: V2[]; drawKind: "surface" | "lawn" | "bed"; drawUse: SurfaceUse;
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
  startDraw: (kind: "surface" | "lawn" | "bed", use?: SurfaceUse) => void;
  addDrawPt: (p: V2) => void; finishDraw: () => void; cancelDraw: () => void;
  applyMaterial: (id: string) => void; applyPattern: (p: Pattern) => void; applyEdging: (e: Edging) => void;
  set: (patch: Partial<State>) => void;
  setSettings: (p: Partial<Settings>) => void;
  notify: (msg: string) => void;
  save: () => void; load: () => boolean; loadSample: () => void; newProject: (w: number, l: number) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useStore = create<State>((set, get) => ({
  project: sampleProject(), past: [], future: [],
  selectedId: null, mode: "2d", view3d: "perspective", cameraNonce: 0,
  tool: "select", drawPts: [], drawKind: "surface", drawUse: "other",
  armed: null, multi: false,
  defMaterial: "kb-grafit", defPattern: "classic", defEdging: "none",
  settings: { units: "m", snap: true, grid: true, dims: true, waste: 8, quality: "high" },
  panel: "plot", panelOpen: true, welcome: true, summaryOpen: false,
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
    const [cx, cy] = at ?? s.viewCenter;
    const n = item.group ?? 1;
    const base: Omit<PlanObject, "id" | "x" | "y"> = {
      kind: item.kind, w: item.w, h: item.h, rot: 0, species: item.species, height: item.height,
      material: item.material, facade: item.kind === "house" || item.kind === "garage" ? "white" : undefined,
      ...(item.kind === "lawn" || item.kind === "bed" ? { poly: [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]] as V2[] } : {}),
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
    added.forEach((o) => { if (o.w !== o.h && ["tree", "shrub", "grass", "planter"].includes(o.kind)) o.h = o.w; });
    set((st) => ({ project: { ...st.project, objects: [...st.project.objects, ...added] }, selectedId: last, viewCenter: [cx + 0.9, cy + 0.9] }));
  },

  startDraw: (kind, use = "other") => set({ tool: "draw", drawKind: kind, drawUse: use, drawPts: [], armed: null, selectedId: null, mode: "2d" }),
  addDrawPt: (p) => set((s) => ({ drawPts: [...s.drawPts, p] })),
  finishDraw: () => {
    const s = get();
    if (s.drawPts.length < 3) { set({ tool: "select", drawPts: [] }); return; }
    const mat = s.drawKind === "lawn" ? "tr-rolowany" : s.drawKind === "bed" ? "rb-kora" : s.defMaterial;
    const m = matById(mat);
    const id = get().addObject({
      kind: s.drawKind, ...polyFromPoints(s.drawPts),
      material: m.kind === s.drawKind ? mat : s.drawKind === "surface" ? s.defMaterial : mat,
      pattern: s.defPattern, edging: s.defEdging, use: s.drawKind === "surface" ? s.drawUse : undefined,
    });
    set({ tool: "select", drawPts: [], selectedId: id });
  },
  cancelDraw: () => set({ tool: "select", drawPts: [] }),

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
