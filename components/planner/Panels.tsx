"use client";
import { useState } from "react";
import { useStore, hasSaved, type PanelId } from "@/lib/store";
import { BUILDING_ITEMS, ELEMENT_ITEMS, GARDEN_CATS, GARDEN_ITEMS, LIGHT_ITEM, MATERIALS, MATERIAL_CATS, PATTERNS, SURFACE_USES, matById, type LibItem } from "@/lib/catalog";
import type { Edging, Lighting, SurfaceUse } from "@/lib/types";
import { Field, ItemThumb, MatSwatch, NumField, Seg, Select } from "./ui";
import { polyFromPoints } from "@/lib/geometry";

export const PANEL_TITLES: Record<PanelId, string> = {
  plot: "Działka", buildings: "Budynki", surfaces: "Nawierzchnie", garden: "Ogród", elements: "Elementy", lighting: "Oświetlenie", settings: "Ustawienia",
};

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-5 text-[10px] font-medium uppercase tracking-[.2em] text-sage first:mt-0">{children}</h3>;
}
function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] leading-relaxed text-stone">{children}</p>;
}

function LibGrid({ items }: { items: LibItem[] }) {
  const s = useStore();
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => (
        <button key={it.id} onClick={() => (s.multi && !it.group ? s.set({ armed: it, tool: "select", mode: "2d" }) : (s.set({ mode: "2d" }), s.addFromLib(it)))}
          className={`group flex flex-col gap-2 border p-2 text-left transition hover:border-sage ${s.armed?.id === it.id ? "border-sage bg-botanic" : "border-[#2a342e] bg-[#181f1b]"}`}>
          <ItemThumb item={it} />
          <span className="text-[12px] leading-tight text-[#e2e9e2]">{it.name}</span>
        </button>
      ))}
    </div>
  );
}

function PlotPanel() {
  const s = useStore();
  const { plot, fence } = s.project;
  const sc = s.settings.units === "cm" ? 100 : 1;
  const addGate = (it: LibItem) => s.addFromLib(it, [plot.w / 2, plot.l]);
  return (
    <div className="space-y-4">
      <Field label="Nazwa projektu"><input className="pl-input" value={s.project.name} onChange={(e) => s.patchProject({ name: e.target.value }, false)} /></Field>
      <H>Wymiary działki (prostokąt)</H>
      <div className="grid grid-cols-2 gap-2">
        <NumField label="Szerokość" value={plot.w} min={5} max={120} scale={sc} suffix={s.settings.units} onCommit={(v) => s.setPlot(v, plot.l)} />
        <NumField label="Długość" value={plot.l} min={5} max={120} scale={sc} suffix={s.settings.units} onCommit={(v) => s.setPlot(plot.w, v)} />
      </div>
      <Note>Powierzchnia działki: {(plot.w * plot.l).toFixed(0)} m². Ulica znajduje się przy dolnej krawędzi planu. W tym prototypie działka jest prostokątem — własny kształt (wielokąt) jest planowany w kolejnej wersji.</Note>
      <H>Ogrodzenie</H>
      <label className="flex items-center gap-2 text-[12px] text-[#e2e9e2]"><input type="checkbox" checked={fence.enabled} onChange={(e) => s.patchProject({ fence: { ...fence, enabled: e.target.checked } })} /> Ogrodzenie wokół działki</label>
      {fence.enabled && <Seg value={fence.style} onChange={(v) => s.patchProject({ fence: { ...fence, style: v } })} options={[{ id: "graphite", name: "Grafit" }, { id: "wood", name: "Drewno" }, { id: "light", name: "Jasne" }]} />}
      <H>Wjazd i wejście</H>
      <div className="grid grid-cols-2 gap-2">
        <button className="pl-btn" onClick={() => addGate(ELEMENT_ITEMS[1])}>+ Brama wjazdowa</button>
        <button className="pl-btn" onClick={() => addGate(ELEMENT_ITEMS[2])}>+ Furtka</button>
      </div>
      <Note>Bramy i furtki dodają się na dolnej krawędzi działki — przesuń je wzdłuż ogrodzenia w planie 2D. Ogrodzenie zostawia w tym miejscu przejście.</Note>
    </div>
  );
}

function SurfacesPanel() {
  const s = useStore();
  const [cat, setCat] = useState<string>(MATERIAL_CATS[0]);
  const [use, setUse] = useState<SurfaceUse>("driveway");
  const sel = s.project.objects.find((o) => o.id === s.selectedId);
  const surf = sel?.kind === "surface" ? sel : null;
  const activeMat = sel && ["surface", "lawn", "bed"].includes(sel.kind) ? sel.material : s.defMaterial;
  const curMat = matById(surf?.material ?? s.defMaterial);
  const pattern = surf?.pattern ?? s.defPattern;
  const edging = surf?.edging ?? s.defEdging;
  const addRect = () => {
    const [cx, cy] = s.viewCenter;
    const [w, h] = use === "driveway" ? [3.2, 8] : use === "path" ? [1.2, 6] : [5, 4];
    s.addObject({ kind: "surface", ...polyFromPoints([[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]]), material: s.defMaterial, pattern: s.defPattern, edging: s.defEdging, use });
  };
  return (
    <div className="space-y-3">
      <H>Nowa nawierzchnia</H>
      <Select value={use} onChange={setUse} options={SURFACE_USES} />
      <div className="grid grid-cols-2 gap-2">
        <button className="pl-btn" onClick={addRect}>+ Prostokąt</button>
        <button className="pl-btn pl-btn-primary" onClick={() => s.startDraw("surface", use)}>Rysuj obszar</button>
      </div>
      <H>Biblioteka materiałów</H>
      <div className="scroll-thin -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {MATERIAL_CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`shrink-0 border px-2 py-1 text-[11px] ${cat === c ? "border-sage bg-sage text-charcoal" : "border-[#2f3a33] text-[#cfd8cf] hover:border-sage"}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MATERIALS.filter((m) => m.cat === cat).map((m) => (
          <button key={m.id} onClick={() => s.applyMaterial(m.id)} className={`flex flex-col gap-1 border p-1.5 text-left transition hover:border-sage ${activeMat === m.id ? "border-sage ring-1 ring-sage" : "border-[#2a342e]"}`}>
            <MatSwatch id={m.id} size={72} />
            <span className="text-[11px] leading-tight text-[#dfe7df]">{m.name}</span>
          </button>
        ))}
      </div>
      <Note>{surf ? "Zmiany dotyczą zaznaczonej nawierzchni." : "Zaznacz obszar w planie, aby zmienić jego materiał. Bez zaznaczenia ustawiasz domyślny materiał dla nowych nawierzchni."}</Note>
      {curMat.tex === "bricks" && (
        <>
          <H>Układ kostki</H>
          <div className="grid grid-cols-4 gap-1.5">
            {PATTERNS.map((p) => (
              <button key={p.id} onClick={() => s.applyPattern(p.id)} className={`border p-1 text-[10px] ${pattern === p.id ? "border-sage text-sage" : "border-[#2a342e] text-[#cfd8cf]"}`}>
                <MatSwatch id={curMat.id} pattern={p.id} size={44} />
                <span className="mt-1 block">{p.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <H>Obrzeże</H>
      <Seg<Edging> value={edging} onChange={s.applyEdging} options={[{ id: "none", name: "Brak" }, { id: "graphite", name: "Grafitowe" }, { id: "light", name: "Jasne" }]} />
    </div>
  );
}

function GardenPanel() {
  const s = useStore();
  const [cat, setCat] = useState<string>(GARDEN_CATS[1]);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button className="pl-btn pl-btn-primary" onClick={() => s.startDraw("lawn")}>Rysuj trawnik</button>
        <button className="pl-btn pl-btn-primary" onClick={() => s.startDraw("bed")}>Rysuj rabatę</button>
      </div>
      <div className="scroll-thin -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {GARDEN_CATS.map((c) => <button key={c} onClick={() => setCat(c)} className={`shrink-0 border px-2 py-1 text-[11px] ${cat === c ? "border-sage bg-sage text-charcoal" : "border-[#2f3a33] text-[#cfd8cf] hover:border-sage"}`}>{c}</button>)}
      </div>
      <LibGrid items={GARDEN_ITEMS.filter((i) => i.cat === cat)} />
      <label className="flex items-center gap-2 text-[12px] text-[#e2e9e2]"><input type="checkbox" checked={s.multi} onChange={(e) => s.set({ multi: e.target.checked, armed: null })} /> Sadzenie wielokrotne (klikaj na planie)</label>
      <Note>Kliknij element, aby dodać go na środek widoku. Grupy (np. 5 lawend) dodają kilka roślin naraz. Te same obiekty widać w widoku 3D.</Note>
    </div>
  );
}

function ElementsPanel() {
  return <div className="space-y-3"><LibGrid items={ELEMENT_ITEMS} /><Note>Ogrodzenie ustaw w planie i obróć uchwytem. Ogrodzenie całej działki włączysz w panelu „Działka”.</Note></div>;
}
function BuildingsPanel() {
  return <div className="space-y-3"><LibGrid items={BUILDING_ITEMS} /><Note>Ustaw budynek na działce, a wymiary, wysokość i elewację zmienisz w pasku właściwości pod planem. Wymiary są przybliżone.</Note></div>;
}

function LightingPanel() {
  const s = useStore();
  const lamps = s.project.objects.filter((o) => o.kind === "light").length;
  return (
    <div className="space-y-3">
      <H>Pora dnia (widok 3D)</H>
      <Seg<Lighting> value={s.project.lighting} onChange={(v) => s.patchProject({ lighting: v })} options={[{ id: "day", name: "Dzień" }, { id: "golden", name: "Złota godzina" }, { id: "evening", name: "Wieczór" }]} />
      <H>Lampy ogrodowe</H>
      <LibGrid items={[LIGHT_ITEM]} />
      <Note>W projekcie: {lamps} lamp. Lampy świecą w widoku „Złota godzina” i „Wieczór”. W trybie niskiej jakości świecą tylko emisyjnie — bez dynamicznych świateł.</Note>
    </div>
  );
}

function SettingsPanel() {
  const s = useStore();
  const st = s.settings;
  const Chk = ({ k, label }: { k: "snap" | "grid" | "dims"; label: string }) => <label className="flex items-center gap-2 text-[12px] text-[#e2e9e2]"><input type="checkbox" checked={st[k]} onChange={(e) => s.setSettings({ [k]: e.target.checked })} /> {label}</label>;
  return (
    <div className="space-y-3">
      <Seg value={st.units} onChange={(v) => s.setSettings({ units: v })} label="Jednostki wymiarów" options={[{ id: "m", name: "Metry (m)" }, { id: "cm", name: "Centymetry (cm)" }]} />
      <Chk k="snap" label="Przyciąganie do siatki i krawędzi" />
      <Chk k="grid" label="Siatka 1 m" />
      <Chk k="dims" label="Wymiary na planie" />
      <NumField label="Zapas materiału (odpad)" value={st.waste} min={0} max={30} step={1} suffix="%" onCommit={(v) => s.setSettings({ waste: v })} />
      <Seg value={st.quality} onChange={(v) => s.setSettings({ quality: v })} label="Jakość 3D" options={[{ id: "high", name: "Wysoka" }, { id: "low", name: "Oszczędna" }]} />
      <Note>„Oszczędna” wyłącza cienie i dynamiczne światła — dla słabszych urządzeń.</Note>
      <H>Projekt</H>
      <div className="grid grid-cols-2 gap-2">
        <button className="pl-btn" onClick={() => s.loadSample()}>Projekt przykładowy</button>
        <button className="pl-btn" onClick={() => s.set({ welcome: true })}>Nowy projekt</button>
        <button className="pl-btn" disabled={!hasSaved()} onClick={() => (s.load() ? s.notify("Wczytano zapisany projekt.") : s.notify("Brak zapisanego projektu."))}>Wczytaj zapis</button>
        <button className="pl-btn" onClick={s.save}>Zapisz</button>
      </div>
      <Note>Skróty: Delete — usuń, Ctrl/⌘+Z — cofnij, Ctrl/⌘+Shift+Z — ponów, Ctrl/⌘+D — duplikuj, strzałki — przesuń o 10 cm, Esc — anuluj.</Note>
      <Note>Zapis działa lokalnie w przeglądarce (localStorage). Wersjonowany format projektu jest gotowy do podpięcia pod bazę danych (np. Supabase).</Note>
    </div>
  );
}

export function PanelContent({ id }: { id: PanelId }) {
  switch (id) {
    case "plot": return <PlotPanel />;
    case "buildings": return <BuildingsPanel />;
    case "surfaces": return <SurfacesPanel />;
    case "garden": return <GardenPanel />;
    case "elements": return <ElementsPanel />;
    case "lighting": return <LightingPanel />;
    case "settings": return <SettingsPanel />;
  }
}
