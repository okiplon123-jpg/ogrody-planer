"use client";
import { SIMPLE_ITEMS } from "@/lib/catalog";
import { DRAW_TARGETS, useStore, type DrawMode, type DrawTarget } from "@/lib/store";
import { ItemThumb, NumField, Seg } from "./ui";

const MODE_HELP: Record<DrawMode, string> = {
  band: "Pas: klikasz punkty wzdłuż ścieżki, a planer robi z nich krzywą o wybranej szerokości. Koniec: dwuklik lub Enter.",
  free: "Odręcznie: przytrzymaj mysz i narysuj obrys, puść, żeby go zamknąć.",
  points: "Punkty: klikasz kolejne punkty obrysu. Koniec: pierwszy punkt, dwuklik lub Enter.",
};

export function Toolbox() {
  const s = useStore();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[11px] uppercase tracking-wider text-[var(--color-ink)]">Dodaj do działki</h2>
        <p className="mt-1 text-[12px] leading-snug text-[var(--color-ink-2)]">Kliknij element albo przeciągnij go na plan.</p>
      </div>
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-3">
        {SIMPLE_ITEMS.map((it) => (
          <button key={it.id} draggable onDragStart={(e) => { e.dataTransfer.setData("text/lib", it.id); e.dataTransfer.effectAllowed = "copy"; }}
            onClick={() => { s.set({ mode: "2d" }); s.addFromLib(it); }}
            className="flex flex-col items-center gap-1.5 border border-[var(--color-rule)] bg-[var(--color-paper)] p-2 text-[12px] text-[var(--color-ink-2)] transition hover:border-[var(--color-ink)] active:translate-y-px">
            <ItemThumb item={it} />{it.name}
          </button>
        ))}
      </div>

      <div className="border-t border-[var(--color-ink)] pt-4">
        <h2 className="text-[11px] uppercase tracking-wider text-[var(--color-ink)]">Narysuj własny kształt</h2>
        <p className="mt-1 text-[12px] leading-snug text-[var(--color-muted)]">Kręta ścieżka, oczko trawnika, zaokrąglona rabata. Po narysowaniu przeciągaj kółka na krawędzi; dwuklik na krawędzi dodaje punkt.</p>
        <div className="mt-3 space-y-3">
          <label className="block"><span className="pl-label mb-1 block">Co rysujesz</span>
            <select className="pl-input" value={s.drawTarget} onChange={(e) => s.setDrawTarget(e.target.value as DrawTarget)}>
              {(Object.keys(DRAW_TARGETS) as DrawTarget[]).map((t) => <option key={t} value={t}>{DRAW_TARGETS[t].name}</option>)}
            </select>
          </label>
          <Seg<DrawMode> value={s.drawMode} onChange={(v) => s.setDraw({ drawMode: v })} options={[{ id: "points", name: "Punkty" }, { id: "free", name: "Odręcznie" }, { id: "band", name: "Pas" }]} />
          <p className="text-[11px] leading-snug text-[var(--color-muted)]">{MODE_HELP[s.drawMode]}</p>
          <button className={`pl-btn w-full ${s.tool === "draw" ? "" : "pl-btn-primary"}`} onClick={() => (s.tool === "draw" ? s.cancelDraw() : s.startDraw())}>
            {s.tool === "draw" ? "Anuluj rysowanie" : `Rysuj: ${DRAW_TARGETS[s.drawTarget].name.toLowerCase()}`}
          </button>
          <label className="flex items-center gap-2 text-[12px] text-[var(--color-ink-2)]">
            <input type="checkbox" checked={s.drawSmooth} onChange={(e) => s.setDraw({ drawSmooth: e.target.checked })} /> Gładkie, zaokrąglone krawędzie
          </label>
          {s.drawMode === "band" && <NumField label="Szerokość pasa" value={s.drawWidth} min={0.4} max={12} onCommit={(v) => s.setDraw({ drawWidth: v })} />}
        </div>
      </div>

      <label className="flex items-center gap-2 text-[12px] text-[var(--color-ink-2)]">
        <input type="checkbox" checked={s.project.fence.enabled} onChange={(e) => s.patchProject({ fence: { ...s.project.fence, enabled: e.target.checked } })} /> Ogrodzenie wokół działki
      </label>
      <button className="pl-btn text-left" onClick={() => s.loadSample()}>Wczytaj przykładowy projekt</button>
    </div>
  );
}
