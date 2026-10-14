"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore, type ViewPreset } from "@/lib/store";
import { Toolbox } from "./Toolbox";
import { PlanEditor } from "./PlanEditor";
import { PropertiesBar } from "./PropertiesBar";
import { Summary } from "./Summary";
import { NumField, Seg } from "./ui";
import type { Lighting } from "@/lib/types";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false, loading: () => <div className="absolute inset-0 grid place-items-center text-sm text-stone">Ładowanie sceny 3D…</div> });

export default function Planner() {
  const s = useStore();
  const captureRef = useRef<(() => string) | null>(null);
  const [mount3d, setMount3d] = useState(false);

  useEffect(() => {
    if ((navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth < 768) s.setSettings({ quality: "low" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (s.mode === "3d") setMount3d(true); }, [s.mode]);
  useEffect(() => {
    if (!s.summaryOpen) return;
    setMount3d(true);
    const grab = () => { const d = captureRef.current?.(); if (d) s.set({ preview3d: d }); };
    const t1 = setTimeout(grab, 900), t2 = setTimeout(grab, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [s.summaryOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const setMode = (m: "2d" | "3d") => {
    if (m === "2d" && s.mode === "3d") { const d = captureRef.current?.(); if (d) s.set({ preview3d: d }); }
    s.set({ mode: m, tool: "select", armed: null, drawPts: [] });
  };
  const view = (v: ViewPreset) => s.set({ view3d: v, cameraNonce: s.cameraNonce + 1 });
  const { plot } = s.project;

  return (
    <div className="fixed inset-0 flex flex-col bg-charcoal text-white">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#243029] bg-[#101411] px-3">
        <Link href="/" className="font-serif text-lg leading-none tracking-wide" aria-label="Strona główna">NAZWA MARKI</Link>
        <div className="mx-1 hidden h-6 w-px bg-[#243029] sm:block" />
        <div className="flex items-center gap-2 font-mono text-[11px] text-stone">
          <span className="hidden sm:inline">Działka</span>
          <div className="w-[84px]"><NumField value={plot.w} min={5} max={120} onCommit={(v) => s.setPlot(v, plot.l)} /></div>×
          <div className="w-[84px]"><NumField value={plot.l} min={5} max={120} onCommit={(v) => s.setPlot(plot.w, v)} /></div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button className="pl-btn" aria-label="Cofnij" disabled={!s.past.length} onClick={s.undo}>↶</button>
          <button className="pl-btn" aria-label="Ponów" disabled={!s.future.length} onClick={s.redo}>↷</button>
          <button className="pl-btn hidden sm:block" onClick={s.save}>Zapisz</button>
          <button className="pl-btn pl-btn-primary" onClick={() => s.set({ summaryOpen: true })}>Gotowe</button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col-reverse lg:flex-row">
        <aside className="scroll-thin z-20 max-h-[40vh] shrink-0 overflow-y-auto border-t border-[#243029] bg-[#121714] p-3 lg:max-h-none lg:w-[264px] lg:border-r lg:border-t-0 lg:p-4"><Toolbox /></aside>

        <main className="relative min-h-[300px] min-w-0 flex-1 overflow-hidden">
          <div className={`absolute inset-0 transition-all duration-500 ${s.mode === "2d" ? "opacity-100" : "pointer-events-none opacity-0"}`}><PlanEditor /></div>
          {mount3d && (
            <div className={`absolute inset-0 transition-all duration-500 ${s.mode === "3d" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
              <Scene3D project={s.project} view={s.view3d} nonce={s.cameraNonce} quality={s.settings.quality} visible={s.mode === "3d" || s.summaryOpen} captureRef={captureRef} />
            </div>
          )}
          <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 border border-[#33403a] bg-[#101411]/95 shadow-lg" role="tablist" aria-label="Tryb widoku">
            {(["2d", "3d"] as const).map((m) => (
              <button key={m} role="tab" aria-selected={s.mode === m} onClick={() => setMode(m)} className={`px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition ${s.mode === m ? "bg-sage text-charcoal" : "text-[#cfd8cf] hover:bg-botanic"}`}>{m === "2d" ? "Plan" : "3D"}</button>
            ))}
          </div>
          {s.mode === "3d" && (
            <>
              <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 border border-[#2a342e] bg-[#101411]/92 p-2">
                <Seg<Lighting> value={s.project.lighting} onChange={(v) => s.patchProject({ lighting: v })} options={[{ id: "day", name: "Dzień" }, { id: "golden", name: "Zachód" }, { id: "evening", name: "Wieczór" }]} />
                <Seg<ViewPreset> value={s.view3d} onChange={view} options={[{ id: "perspective", name: "Widok" }, { id: "top", name: "Z góry" }, { id: "eye", name: "Z ziemi" }]} />
              </div>
              <div className="pointer-events-none absolute bottom-3 left-3 z-10 text-[11px] text-white/60">Przeciągnij — obrót · scroll — zoom · prawy przycisk — przesuwanie</div>
            </>
          )}
          {s.mode === "2d" && <PropertiesBar />}
          {s.toast && <div role="status" className="absolute left-1/2 top-16 z-30 max-w-[90%] -translate-x-1/2 border border-sage/60 bg-charcoal px-4 py-2 text-[12px] text-sage shadow-xl">{s.toast}</div>}
        </main>
        {s.summaryOpen && <Summary />}
      </div>
    </div>
  );
}
