"use client";
import { useStore } from "@/lib/store";
import { KIND_LABEL, MATERIALS, PATTERNS, SHAPE_KINDS, SPECIES, matById } from "@/lib/catalog";
import { fmtArea, objectArea } from "@/lib/geometry";
import type { Facade } from "@/lib/types";
import { MatSwatch, NumField } from "./ui";

const SURFACE_PICKS = ["ph-behaton", "ph-granit", "ph-bruzowa", "ph-klinkier", "ph-bruk", "ph-zwir", "kb-grafit", "kb-szara", "kb-melanz", "kb-piasek", "ks-czarna", "ks-jasna", "pt-wielko", "pt-kamien", "zw-dekor", "in-deska"];

/** Floating contextual bar: only the few things a person actually wants to change. */
export function PropertiesBar() {
  const s = useStore();
  const o = s.project.objects.find((x) => x.id === s.selectedId);
  if (!o) return null;
  const set = (p: Parameters<typeof s.update>[1]) => s.update(o.id, p);
  const m = matById(o.material);
  const picks = o.kind === "surface" ? SURFACE_PICKS.map((id) => matById(id)) : MATERIALS.filter((x) => x.kind === o.kind);
  const plants = Object.entries(SPECIES).filter(([, v]) => (o.kind === "tree" ? ["round", "birch", "cone"].includes(v.style) : o.kind === "shrub" ? ["bush", "column"].includes(v.style) : false));
  return (
    <div className="absolute inset-x-3 bottom-3 z-20 mx-auto flex max-w-[860px] flex-wrap items-center gap-x-4 gap-y-2 border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 shadow-2xl">
      <div className="min-w-[90px]">
        <div className="text-[11px] uppercase tracking-wider text-[var(--color-ink)]">{KIND_LABEL[o.kind]}</div>
        {["surface", "lawn", "bed", "house", "garage", "water"].includes(o.kind) && <div className="text-[11px] text-[var(--color-muted)]">{fmtArea(objectArea(o))}</div>}
      </div>
      {SHAPE_KINDS.includes(o.kind) && (
        <label className="flex items-center gap-2 text-[12px] text-[var(--color-ink-2)]">
          <input type="checkbox" checked={!!o.smooth} onChange={(e) => s.reshape(o.id, { smooth: e.target.checked })} /> Gładkie krawędzie
        </label>
      )}
      {o.band ? <div className="w-[110px]"><NumField label="Szerokość" value={o.band} min={0.4} max={12} onCommit={(v) => s.reshape(o.id, { band: v })} /></div> : null}
      {picks.length > 0 && ["surface", "lawn", "bed"].includes(o.kind) && (
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Materiał">
          {picks.map((x) => (
            <button key={x.id} role="radio" aria-checked={o.material === x.id} title={x.name} onClick={() => set({ material: x.id, pattern: x.pattern ?? o.pattern })} className={`border-2 ${o.material === x.id ? "border-[var(--color-ink)]" : "border-transparent hover:border-[var(--color-ink)]"}`}><MatSwatch id={x.id} size={34} /></button>
          ))}
        </div>
      )}
      {o.kind === "surface" && m.tex === "bricks" && (
        <select className="pl-input !w-auto" aria-label="Układ" value={o.pattern ?? m.pattern} onChange={(e) => set({ pattern: e.target.value as never })}>{PATTERNS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      )}
      {plants.length > 0 && (
        <select className="pl-input !w-auto" aria-label="Gatunek" value={o.species ?? plants[0][0]} onChange={(e) => set({ species: e.target.value })}>{plants.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select>
      )}
      {o.kind === "house" && (
        <div className="flex gap-1" role="radiogroup" aria-label="Dach">
          {([["gable", "Dwuspadowy"], ["flat", "Płaski"]] as const).map(([id, n]) => <button key={id} role="radio" aria-checked={(o.roof ?? "gable") === id} onClick={() => set({ roof: id })} className={`pl-btn ${(o.roof ?? "gable") === id ? "!bg-[var(--color-accent)] !text-[var(--color-accent-ink)]" : ""}`}>{n}</button>)}
        </div>
      )}
      {(o.kind === "house" || o.kind === "garage") && (
        <div className="flex gap-1" role="radiogroup" aria-label="Elewacja">
          {([["white", "Biała"], ["graphite", "Grafit"], ["wood", "Drewno"]] as [Facade, string][]).map(([id, n]) => <button key={id} role="radio" aria-checked={(o.facade ?? "white") === id} onClick={() => set({ facade: id })} className={`pl-btn ${(o.facade ?? "white") === id ? "!border-[var(--color-ink)] !text-[var(--color-ink)]" : ""}`}>{n}</button>)}
        </div>
      )}
      <div className="ml-auto flex gap-1.5">
        <button className="pl-btn" onClick={() => set({ rot: (o.rot + 90) % 360 })}>Obróć</button>
        <button className="pl-btn" onClick={() => s.duplicate(o.id)}>Duplikuj</button>
        <button className="pl-btn !border-[var(--color-error)] !text-[var(--color-error)] hover:!border-[var(--color-error)]" onClick={() => s.remove(o.id)}>Usuń</button>
      </div>
    </div>
  );
}
