"use client";
import { useStore } from "@/lib/store";
import { KIND_LABEL, MATERIALS, PATTERNS, POINT_KINDS, SPECIES, SURFACE_USES, matById } from "@/lib/catalog";
import { fmtArea, objectArea } from "@/lib/geometry";
import type { Edging, Facade, Pattern, SurfaceUse } from "@/lib/types";
import { Field, NumField, Select } from "./ui";

export function PropertiesBar() {
  const s = useStore();
  const o = s.project.objects.find((x) => x.id === s.selectedId);
  if (!o) {
    return <div className="flex h-full items-center px-4 text-[12px] text-stone">Zaznacz obiekt na planie, aby edytować jego właściwości. Przeciągaj obiekty myszą, uchwyty zmieniają rozmiar i obrót.</div>;
  }
  const u = s.settings.units, sc = u === "cm" ? 100 : 1;
  const set = (p: Parameters<typeof s.update>[1]) => s.update(o.id, p);
  const point = POINT_KINDS.includes(o.kind);
  const mats = MATERIALS.filter((m) => m.kind === (o.kind === "lawn" ? "lawn" : o.kind === "bed" ? "bed" : "surface"));
  const m = matById(o.material);
  const plants = Object.entries(SPECIES).filter(([, v]) => (o.kind === "tree" ? ["round", "birch", "cone"].includes(v.style) : o.kind === "shrub" ? ["bush", "column"].includes(v.style) : false));
  return (
    <div className="scroll-thin flex h-full items-end gap-3 overflow-x-auto px-4 py-2">
      <div className="min-w-[110px] self-center"><div className="pl-label">Zaznaczono</div><div className="font-serif text-lg leading-tight text-white">{KIND_LABEL[o.kind]}</div>
        {["surface", "lawn", "bed", "house", "garage", "water"].includes(o.kind) && <div className="text-[11px] text-sage">{fmtArea(objectArea(o))}</div>}</div>
      {point ? (
        <NumField label="Średnica" value={o.w} min={0.2} max={12} scale={sc} suffix={u} onCommit={(v) => set({ w: v, h: v })} />
      ) : (
        <>
          <NumField label="Szerokość" value={o.w} min={0.1} max={80} scale={sc} suffix={u} onCommit={(v) => set({ w: v })} />
          <NumField label="Głębokość" value={o.h} min={0.05} max={80} scale={sc} suffix={u} onCommit={(v) => set({ h: v })} />
        </>
      )}
      <NumField label="Obrót" value={o.rot} min={0} max={359} step={5} suffix="°" onCommit={(v) => set({ rot: v % 360 })} />
      <NumField label="Pozycja X" value={o.x} min={-5} max={150} scale={sc} suffix={u} onCommit={(v) => set({ x: v })} />
      <NumField label="Pozycja Y" value={o.y} min={-5} max={150} scale={sc} suffix={u} onCommit={(v) => set({ y: v })} />
      {(o.kind === "house" || o.kind === "garage") && (
        <>
          <NumField label="Wysokość" value={o.height ?? 3} min={2} max={14} scale={sc} suffix={u} onCommit={(v) => set({ height: v })} />
          <div className="min-w-[110px]"><Field label="Elewacja"><Select<Facade> value={o.facade ?? "white"} onChange={(v) => set({ facade: v })} options={[{ id: "white", name: "Biała" }, { id: "graphite", name: "Grafitowa" }, { id: "wood", name: "Drewno" }]} /></Field></div>
        </>
      )}
      {(o.kind === "surface" || o.kind === "lawn" || o.kind === "bed") && (
        <div className="min-w-[150px]"><Field label="Materiał"><Select value={o.material ?? mats[0].id} onChange={(v) => set({ material: v, pattern: matById(v).pattern ?? o.pattern })} options={mats.map((x) => ({ id: x.id, name: x.name }))} /></Field></div>
      )}
      {o.kind === "surface" && (
        <>
          <div className="min-w-[120px]"><Field label="Przeznaczenie"><Select<SurfaceUse> value={o.use ?? "other"} onChange={(v) => set({ use: v })} options={SURFACE_USES} /></Field></div>
          {m.tex === "bricks" && <div className="min-w-[120px]"><Field label="Układ"><Select<Pattern> value={o.pattern ?? m.pattern ?? "classic"} onChange={(v) => set({ pattern: v })} options={PATTERNS} /></Field></div>}
          <div className="min-w-[120px]"><Field label="Obrzeże"><Select<Edging> value={o.edging ?? "none"} onChange={(v) => set({ edging: v })} options={[{ id: "none", name: "Brak" }, { id: "graphite", name: "Grafitowe" }, { id: "light", name: "Jasne" }]} /></Field></div>
        </>
      )}
      {plants.length > 0 && (
        <div className="min-w-[120px]"><Field label="Gatunek"><Select value={o.species ?? plants[0][0]} onChange={(v) => set({ species: v })} options={plants.map(([k, v]) => ({ id: k, name: v.name }))} /></Field></div>
      )}
      <div className="ml-auto flex shrink-0 gap-2 self-end">
        <button className="pl-btn" onClick={() => s.duplicate(o.id)}>Duplikuj</button>
        <button className="pl-btn !border-red-900/70 !text-red-300 hover:!border-red-400" onClick={() => s.remove(o.id)}>Usuń</button>
      </div>
    </div>
  );
}
