"use client";
import { SIMPLE_ITEMS } from "@/lib/catalog";
import { DRAW_TARGETS, useStore, type DrawMode, type DrawTarget } from "@/lib/store";
import { ItemThumb, NumField, Seg } from "./ui";
import { Quantities } from "./Quantities";

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
        <p className="mt-1 hidden text-[12px] leading-snug text-[var(--color-ink-2)] lg:block">Kliknij element albo przeciągnij go na plan.</p>
      </div>
      <div className="scroll-thin -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {SIMPLE_ITEMS.map((it) => (
          <button key={it.id} draggable onDragStart={(e) => { e.dataTransfer.setData("text/lib", it.id); e.dataTransfer.effectAllowed = "copy"; }}
            onClick={() => { s.set({ mode: "2d", tool: "select", drawPts: [] }); s.addFromLib(it); }}
            className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 border border-[var(--color-rule)] bg-[var(--color-paper)] p-2 text-[12px] lg:w-auto lg:shrink text-[var(--color-ink-2)] transition hover:border-[var(--color-ink)] active:translate-y-px">
            <ItemThumb item={it} />{it.name}
          </button>
        ))}
      </div>

      <div className="border-t border-[var(--color-ink)] pt-4">
        <h2 className="text-[11px] uppercase tracking-wider text-[var(--color-ink)]">Rysuj kształt</h2>
        <p className="mt-1 hidden text-[12px] leading-snug text-[var(--color-muted)] lg:block">Wybierz rodzaj i rysuj na planie: kręta ścieżka, oczko trawnika, okrągła rabata.</p>
        <div className="mt-3 grid grid-cols-4 gap-2 lg:grid-cols-2" role="group" aria-label="Rysuj kształt">
          {(Object.keys(DRAW_TARGETS) as DrawTarget[]).map((t) => {
            const on = s.tool === "draw" && s.drawTarget === t;
            return (
              <button key={t} aria-pressed={on} onClick={() => { if (on) { s.cancelDraw(); } else { s.setDrawTarget(t); s.startDraw(); } }} className={`pl-btn ${on ? "pl-btn-primary" : ""}`}>
                {on ? "Anuluj" : DRAW_TARGETS[t].name}
              </button>
            );
          })}
        </div>
        <details className="group mt-3">
          <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-[11px] uppercase tracking-wider text-[var(--color-ink-2)]">Opcje rysowania<span aria-hidden className="text-base transition group-open:rotate-45">+</span></summary>
          <div className="mt-2 space-y-3">
            <Seg<DrawMode> value={s.drawMode} onChange={(v) => s.setDraw({ drawMode: v })} options={[{ id: "points", name: "Punkty" }, { id: "free", name: "Odręcznie" }, { id: "band", name: "Pas" }]} />
            <p className="text-[11px] leading-snug text-[var(--color-muted)]">{MODE_HELP[s.drawMode]}</p>
            <label className="flex items-center gap-2 text-[12px] text-[var(--color-ink-2)]">
              <input type="checkbox" checked={s.drawSmooth} onChange={(e) => s.setDraw({ drawSmooth: e.target.checked })} /> Gładkie, zaokrąglone krawędzie
            </label>
            {s.drawMode === "band" && <NumField label="Szerokość pasa" value={s.drawWidth} min={0.4} max={12} onCommit={(v) => s.setDraw({ drawWidth: v })} />}
          </div>
        </details>
      </div>

      <Quantities />

      <details className="group border-t border-[var(--color-ink)] pt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-[11px] uppercase tracking-wider text-[var(--color-ink-2)]">Więcej<span aria-hidden className="text-base transition group-open:rotate-45">+</span></summary>
        <div className="mt-2 space-y-3">
          <label className="flex items-center gap-2 text-[12px] text-[var(--color-ink-2)]">
            <input type="checkbox" checked={s.project.fence.enabled} onChange={(e) => s.patchProject({ fence: { ...s.project.fence, enabled: e.target.checked } })} /> Ogrodzenie wokół działki
          </label>
          <button className="pl-btn w-full" onClick={() => s.loadSample()}>Wczytaj przykład</button>
        </div>
      </details>
    </div>
  );
}
