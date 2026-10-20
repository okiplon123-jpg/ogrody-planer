"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { decodeProject } from "@/lib/share";
import { DRAW_TARGETS, useStore, type DrawMode, type DrawTarget, type ViewPreset } from "@/lib/store";
import { SIMPLE_ITEMS } from "@/lib/catalog";
import { PlanEditor } from "./PlanEditor";
import { PropertiesBar } from "./PropertiesBar";
import { Quantities } from "./Quantities";
import { Summary } from "./Summary";
import { ItemThumb, NumField, Seg } from "./ui";
import type { Lighting } from "@/lib/types";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false, loading: () => <div className="absolute inset-0 grid place-items-center text-sm text-[var(--color-muted)]">Ładowanie sceny 3D…</div> });

type Sheet = null | "add" | "draw" | "look" | "qty" | "plot";
const SHEET_TITLE: Record<Exclude<Sheet, null>, string> = { add: "Dodaj do działki", draw: "Narysuj kształt", look: "Wygląd", qty: "Ile czego", plot: "Działka i projekt" };

const I = ({ d, size = 24 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const ICON = {
  plus: "M12 5v14M5 12h14",
  pencil: "M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z",
  bars: "M18 20V10M12 20V4M6 20v-6",
  sliders: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  rotate: "M23 4v6h-6M20.5 15a9 9 0 1 1-2.1-9.4L23 10",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  trash: "M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14",
  palette: "M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.2-1.7-.3-.9.2-1.8 1.3-1.8H17a4 4 0 0 0 4-4c0-5-4-9-9-9z",
  undo: "M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
  redo: "M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3",
  check: "M5 12l5 5 9-10",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  x: "M6 6l12 12M18 6L6 18",
};

/** Phone shell for the full planner: same plan, 3D, quantities and send-to-company, with a bottom dock and slide-up panels instead of side palettes and floating bars. */
export default function PlannerPhone() {
  const s = useStore();
  const captureRef = useRef<(() => string) | null>(null);
  const [mount3d, setMount3d] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);

  useEffect(() => {
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    s.setSettings({ quality: mem !== undefined && mem <= 2 ? "low" : "mid" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (s.mode === "3d") setMount3d(true); }, [s.mode]);
  const visible3d = s.mode === "3d" || s.summaryOpen;
  const [scene3dProject, setScene3dProject] = useState(s.project);
  useEffect(() => { if (visible3d) setScene3dProject(s.project); }, [visible3d, s.project]);
  useEffect(() => {
    const m = location.hash.match(/^#p=(.+)$/);
    if (!m) return;
    decodeProject(m[1]).then((p) => { if (p) { useStore.getState().setProject(p); useStore.getState().set({ welcome: false, mode: "2d" }); } else useStore.getState().notify("Nie udało się otworzyć projektu z linku."); });
  }, []);
  useEffect(() => {
    if (!s.summaryOpen) return;
    setMount3d(true);
    const grab = () => { const d = captureRef.current?.(); if (d) s.set({ preview3d: d }); };
    const t1 = setTimeout(grab, 900), t2 = setTimeout(grab, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [s.summaryOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  // a drawing session or a selection closes any open panel
  useEffect(() => { if (s.tool === "draw") setSheet(null); }, [s.tool]);

  const setMode = (m: "2d" | "3d") => {
    if (m === "2d" && s.mode === "3d") { const d = captureRef.current?.(); if (d) s.set({ preview3d: d }); }
    s.set({ mode: m, tool: "select", armed: null, drawPts: [] });
    setSheet(null);
  };
  const view = (v: ViewPreset) => s.set({ view3d: v, cameraNonce: s.cameraNonce + 1 });
  const sel = s.project.objects.find((o) => o.id === s.selectedId);
  const minPts = s.drawMode === "band" ? 2 : 3;

  const DockBtn = ({ icon, label, onClick, tone, disabled }: { icon: string; label: string; onClick: () => void; tone?: "primary" | "danger"; disabled?: boolean }) => (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 border-r border-[var(--color-rule)] px-1 text-[12px] font-semibold last:border-r-0 disabled:opacity-40 ${tone === "primary" ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]" : tone === "danger" ? "text-[var(--color-error)]" : "text-[var(--color-ink)]"}`}>
      <I d={icon} /><span>{label}</span>
    </button>
  );

  let dock: React.ReactNode;
  if (s.tool === "draw") {
    dock = (
      <>
        <p className="border-b border-[var(--color-rule)] px-3 py-2 text-center text-[13px]">
          {s.drawMode === "free" ? "Przeciągnij palcem po planie" : `Stuknij w plan, żeby dodać punkt (${s.drawPts.length})`}
        </p>
        <div className="flex">
          {s.drawMode !== "free" && <DockBtn icon={ICON.undo} label="Cofnij" onClick={s.undoDrawPt} disabled={!s.drawPts.length} />}
          {s.drawMode !== "free" && <DockBtn icon={ICON.check} label="Gotowe" tone="primary" onClick={() => s.finishDraw()} disabled={s.drawPts.length < minPts} />}
          <DockBtn icon={ICON.x} label="Anuluj" onClick={s.cancelDraw} />
        </div>
      </>
    );
  } else if (s.mode === "3d") {
    dock = (
      <div className="space-y-2 p-2">
        <Seg<Lighting> value={s.project.lighting} onChange={(v) => s.patchProject({ lighting: v })} options={[{ id: "day", name: "Dzień" }, { id: "golden", name: "Zachód" }, { id: "evening", name: "Wieczór" }]} />
        <Seg<ViewPreset> value={s.view3d} onChange={view} options={[{ id: "perspective", name: "Widok" }, { id: "top", name: "Z góry" }, { id: "eye", name: "Z ziemi" }]} />
        <button type="button" className="pl-btn pl-btn-primary !min-h-12 w-full" onClick={() => s.set({ summaryOpen: true })}>Wyślij projekt do firmy</button>
      </div>
    );
  } else if (sel) {
    dock = (
      <div className="flex">
        <DockBtn icon={ICON.palette} label="Wygląd" onClick={() => setSheet("look")} />
        <DockBtn icon={ICON.rotate} label="Obróć" onClick={() => s.update(sel.id, { rot: (sel.rot + 90) % 360 })} />
        <DockBtn icon={ICON.copy} label="Kopiuj" onClick={() => s.duplicate(sel.id)} />
        <DockBtn icon={ICON.trash} label="Usuń" tone="danger" onClick={() => s.remove(sel.id)} />
        <DockBtn icon={ICON.check} label="Gotowe" tone="primary" onClick={() => s.select(null)} />
      </div>
    );
  } else {
    dock = (
      <div className="flex">
        <DockBtn icon={ICON.plus} label="Dodaj" onClick={() => setSheet("add")} />
        <DockBtn icon={ICON.pencil} label="Rysuj" onClick={() => setSheet("draw")} />
        <DockBtn icon={ICON.bars} label="Ilości" onClick={() => setSheet("qty")} />
        <DockBtn icon={ICON.sliders} label="Działka" onClick={() => setSheet("plot")} />
        <DockBtn icon={ICON.send} label="Wyślij" tone="primary" onClick={() => s.set({ summaryOpen: true })} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)]">
      <header className="flex h-[52px] shrink-0 items-center gap-2 border-b border-[var(--color-ink)] px-3">
        <Link href="/" className="wordmark !text-base" aria-label="Strona główna">gryczewski<span className="period" aria-hidden /></Link>
        <div className="ml-auto flex items-center gap-1.5">
          <button className="pl-btn !min-h-11 !px-3" aria-label="Cofnij" disabled={!s.past.length} onClick={s.undo}><I d={ICON.undo} size={20} /></button>
          <button className="pl-btn !min-h-11 !px-3" aria-label="Ponów" disabled={!s.future.length} onClick={s.redo}><I d={ICON.redo} size={20} /></button>
          <button className="pl-btn pl-btn-primary !min-h-11" onClick={() => s.set({ summaryOpen: true })}>Wyślij</button>
        </div>
      </header>

      <main className="relative min-h-0 flex-1 overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-300 ${s.mode === "2d" ? "opacity-100" : "pointer-events-none opacity-0"}`}><PlanEditor phone /></div>
        {mount3d && (
          <div className={`absolute inset-0 transition-opacity duration-300 ${s.mode === "3d" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <Scene3D project={scene3dProject} view={s.view3d} nonce={s.cameraNonce} quality={s.settings.quality} visible={s.mode === "3d" || s.summaryOpen} captureRef={captureRef} />
          </div>
        )}
        <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 border border-[var(--color-rule)] bg-[var(--color-paper)] shadow-lg" role="tablist" aria-label="Tryb widoku">
          {(["2d", "3d"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={s.mode === m} onClick={() => setMode(m)} className={`min-h-11 px-5 text-[12px] font-semibold uppercase tracking-wider ${s.mode === m ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]" : "text-[var(--color-ink-2)]"}`}>{m === "2d" ? "Plan" : "3D"}</button>
          ))}
        </div>
        {s.toast && <div role="status" className="absolute left-1/2 top-16 z-30 max-w-[90%] -translate-x-1/2 border border-[var(--color-ink)] bg-[var(--color-paper)] px-4 py-2 text-[13px] shadow-xl">{s.toast}</div>}
      </main>

      <nav aria-label="Narzędzia" className="shrink-0 border-t border-[var(--color-ink)] bg-[var(--color-paper)] pb-[env(safe-area-inset-bottom)]">{dock}</nav>

      {sheet && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <button type="button" aria-label="Zamknij panel" className="min-h-0 flex-1 bg-black/40" onClick={() => setSheet(null)} />
          <section role="dialog" aria-label={SHEET_TITLE[sheet]} className="max-h-[78%] overflow-y-auto border-t border-[var(--color-ink)] bg-[var(--color-paper)] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="h3">{SHEET_TITLE[sheet]}</h2>
              <button type="button" className="pl-btn !min-h-11" onClick={() => setSheet(null)}>Zamknij</button>
            </div>

            {sheet === "add" && (
              <div className="grid grid-cols-3 gap-2">
                {SIMPLE_ITEMS.map((it) => (
                  <button key={it.id} type="button" onClick={() => { s.set({ mode: "2d", tool: "select", drawPts: [] }); s.addFromLib(it); setSheet(null); }}
                    className="flex min-h-[104px] flex-col items-center gap-2 border border-[var(--color-rule)] p-2 text-[13px] active:bg-[var(--color-paper-2)]">
                    <ItemThumb item={it} />{it.name}
                  </button>
                ))}
              </div>
            )}

            {sheet === "draw" && (
              <div className="space-y-4">
                <p className="text-[14px] leading-snug text-[var(--color-ink-2)]">Wybierz, co rysujesz, a potem stukaj w plan, żeby postawić kolejne punkty kształtu.</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(DRAW_TARGETS) as DrawTarget[]).map((t) => (
                    <button key={t} type="button" className="pl-btn !min-h-14 !text-[14px]" onClick={() => { s.setDrawTarget(t); s.startDraw(); setSheet(null); }}>{DRAW_TARGETS[t].name}</button>
                  ))}
                </div>
                <div>
                  <p className="label mb-2">sposób rysowania</p>
                  <Seg<DrawMode> value={s.drawMode} onChange={(v) => s.setDraw({ drawMode: v })} options={[{ id: "points", name: "Punkty" }, { id: "free", name: "Odręcznie" }, { id: "band", name: "Pas" }]} />
                </div>
                <label className="flex min-h-11 items-center gap-3 text-[14px]">
                  <input type="checkbox" className="h-6 w-6" checked={s.drawSmooth} onChange={(e) => s.setDraw({ drawSmooth: e.target.checked })} /> Gładkie, zaokrąglone krawędzie
                </label>
                {s.drawMode === "band" && <NumField label="Szerokość pasa" value={s.drawWidth} min={0.4} max={12} onCommit={(v) => s.setDraw({ drawWidth: v })} />}
              </div>
            )}

            {sheet === "look" && sel && <PropertiesBar inline />}

            {sheet === "qty" && (
              <div className="space-y-4">
                <Quantities />
                <button type="button" className="pl-btn pl-btn-primary !min-h-14 w-full" onClick={() => { setSheet(null); s.set({ summaryOpen: true }); }}>Podsumowanie i wysyłka do firmy</button>
              </div>
            )}

            {sheet === "plot" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <NumField label="Szerokość działki" value={s.project.plot.w} min={5} max={120} onCommit={(v) => s.setPlot(v, s.project.plot.l)} />
                  <NumField label="Długość działki" value={s.project.plot.l} min={5} max={120} onCommit={(v) => s.setPlot(s.project.plot.w, v)} />
                </div>
                <label className="flex min-h-11 items-center gap-3 text-[14px]">
                  <input type="checkbox" className="h-6 w-6" checked={s.project.fence.enabled} onChange={(e) => s.patchProject({ fence: { ...s.project.fence, enabled: e.target.checked } })} /> Ogrodzenie wokół działki
                </label>
                <button type="button" className="pl-btn !min-h-12 w-full" onClick={() => { s.save(); setSheet(null); }}>Zapisz projekt na tym telefonie</button>
                <button type="button" className="pl-btn !min-h-12 w-full" onClick={() => { s.loadSample(); setSheet(null); }}>Wczytaj przykładowy projekt</button>
                <a href="tel:+48885879108" className="pl-btn !min-h-12 w-full justify-center">Zadzwoń: 885 879 108</a>
              </div>
            )}
          </section>
        </div>
      )}

      {s.summaryOpen && <Summary />}
    </div>
  );
}
