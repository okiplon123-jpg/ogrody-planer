"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { hasSaved, useStore, type PanelId, type ViewPreset } from "@/lib/store";
import { PanelContent, PANEL_TITLES } from "./Panels";
import { PlanEditor } from "./PlanEditor";
import { PropertiesBar } from "./PropertiesBar";
import { Summary } from "./Summary";
import { NumField, Seg } from "./ui";
import type { Lighting } from "@/lib/types";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false, loading: () => <div className="absolute inset-0 flex items-center justify-center text-sm text-stone">Ładowanie sceny 3D…</div> });

const ICONS: Record<PanelId, string> = {
  plot: "M4 4h16v16H4zM4 9h16M9 4v16",
  buildings: "M3 21V9l9-6 9 6v12zM9 21v-6h6v6",
  surfaces: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
  garden: "M12 21V10M12 10c0-4 3-6 6-6 0 4-2 6-6 6zM12 14c0-3-2-5-5-5 0 3 2 5 5 5z",
  elements: "M4 20V8l8-4 8 4v12M9 20v-6h6v6",
  lighting: "M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3 12h3M18 12h3M12 3v3M12 18v3",
};
const ORDER: PanelId[] = ["plot", "buildings", "surfaces", "garden", "elements", "lighting", "settings"];
const STEPS: Record<PanelId, string> = { plot: "Krok 1 · Działka", buildings: "Krok 2 · Budynki", surfaces: "Krok 3 · Nawierzchnie", garden: "Krok 4 · Ogród", elements: "Krok 4 · Elementy", lighting: "Krok 5 · Oświetlenie", settings: "Ustawienia" };

function Icon({ d }: { d: string }) {
  return <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

function Welcome() {
  const s = useStore();
  const [w, setW] = useState(20), [l, setL] = useState(30);
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(hasSaved()), []);
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal/92 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[860px] border border-[#2a342e] bg-[#121714] p-6 sm:p-9">
        <div className="eyebrow text-sage">Planer ogrodu 2D / 3D</div>
        <h1 className="mt-2 font-serif text-4xl text-white sm:text-5xl">Zaprojektuj swoją posesję</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#b9c4b9]">Narysuj działkę, ułóż nawierzchnie i rośliny, a potem zobacz efekt w 3D. Gotowy projekt zapiszesz i pobierzesz jako wizualizację. Wymiary w planerze są orientacyjne — to narzędzie poglądowe, nie dokument geodezyjny.</p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="border border-[#2a342e] p-5">
            <h2 className="font-serif text-2xl text-white">Zacznij od pustej działki</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumField label="Szerokość" value={w} min={5} max={120} suffix="m" onCommit={setW} />
              <NumField label="Długość" value={l} min={5} max={120} suffix="m" onCommit={setL} />
            </div>
            <button className="pl-btn pl-btn-primary mt-4 w-full !py-2.5" onClick={() => s.newProject(w, l)}>Zacznij projektowanie</button>
          </div>
          <div className="flex flex-col border border-[#2a342e] p-5">
            <h2 className="font-serif text-2xl text-white">Wybierz przykładowy projekt</h2>
            <p className="mt-3 flex-1 text-[13px] leading-relaxed text-[#b9c4b9]">Dom z podjazdem z kostki, taras z płyt wielkoformatowych, trawnik, rabaty i oświetlenie. Dane demonstracyjne — nie dotyczą żadnej prawdziwej działki.</p>
            <button className="pl-btn pl-btn-primary mt-4 w-full !py-2.5" onClick={() => s.loadSample()}>Otwórz projekt przykładowy</button>
            {saved && <button className="pl-btn mt-2 w-full" onClick={() => { s.load(); s.set({ welcome: false }); }}>Wczytaj mój zapisany projekt</button>}
          </div>
        </div>
        <Link href="/" className="mt-6 inline-block text-[12px] text-stone underline hover:text-white">← Wróć na stronę główną</Link>
      </div>
    </div>
  );
}

export default function Planner() {
  const s = useStore();
  const captureRef = useRef<(() => string) | null>(null);
  const [mount3d, setMount3d] = useState(false);
  const [mobileNote, setMobileNote] = useState(true);
  const [lowDevice, setLowDevice] = useState(false);

  useEffect(() => {
    const low = (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth < 768;
    setLowDevice(low);
    if (low) s.setSettings({ quality: "low" });
    s.set({ welcome: true });
    if (window.innerWidth < 1024) s.set({ panelOpen: false });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (s.mode === "3d") setMount3d(true); }, [s.mode]);
  useEffect(() => {
    if (!s.summaryOpen) return;
    setMount3d(true);
    const grab = () => { const d = captureRef.current?.(); if (d) s.set({ preview3d: d }); return !!d; };
    const t1 = setTimeout(grab, 700), t2 = setTimeout(grab, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [s.summaryOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const setMode = (m: "2d" | "3d") => {
    if (m === "2d" && s.mode === "3d") { const d = captureRef.current?.(); if (d) s.set({ preview3d: d }); }
    s.set({ mode: m, tool: "select", armed: null, drawPts: [] });
  };
  const pick = (id: PanelId) => s.set(s.panel === id && s.panelOpen ? { panelOpen: false } : { panel: id, panelOpen: true });
  const view = (v: ViewPreset) => s.set({ view3d: v, cameraNonce: s.cameraNonce + 1 });

  return (
    <div className="fixed inset-0 flex flex-col bg-charcoal text-white">
      {/* toolbar */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#243029] bg-[#101411] px-3 sm:gap-4 sm:px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Strona główna">
          <span className="grid h-8 w-8 place-items-center border border-sage font-serif text-lg text-sage">N</span>
          <span className="hidden font-serif text-xl leading-none tracking-wide sm:block">NAZWA MARKI<span className="block text-[9px] font-sans uppercase tracking-[.25em] text-stone">Planer ogrodu</span></span>
        </Link>
        <div className="mx-1 hidden h-8 w-px bg-[#243029] md:block" />
        <div className="hidden min-w-0 md:block">
          <div className="truncate text-[13px] font-medium">{s.project.name}</div>
          <div className="text-[10px] uppercase tracking-[.16em] text-sage">{STEPS[s.panel]}</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button className="pl-btn" aria-label="Cofnij" title="Cofnij (Ctrl+Z)" disabled={!s.past.length} onClick={s.undo}>↶<span className="hidden xl:inline"> Cofnij</span></button>
          <button className="pl-btn" aria-label="Ponów" title="Ponów" disabled={!s.future.length} onClick={s.redo}>↷<span className="hidden xl:inline"> Ponów</span></button>
          <button className="pl-btn hidden sm:block" onClick={s.save}>Zapisz</button>
          <button className="pl-btn hidden sm:block" onClick={() => setMode("3d")}>Podgląd</button>
          <button className="pl-btn pl-btn-primary !px-3 sm:!px-4" onClick={() => s.set({ summaryOpen: true })}>Podsumowanie</button>
        </div>
      </header>
      {mobileNote && (
        <div className="flex items-center justify-between gap-3 bg-botanic px-3 py-1.5 text-[11px] text-[#d9e5d9] lg:hidden">
          <span>Planer najwygodniej obsługuje się na większym ekranie. Na telefonie możesz oglądać projekt i dodawać elementy.</span>
          <button aria-label="Zamknij" onClick={() => setMobileNote(false)}>✕</button>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col-reverse lg:flex-row">
        {/* rail */}
        <nav className="z-30 flex shrink-0 justify-between overflow-x-auto border-t border-[#243029] bg-[#101411] lg:w-[72px] lg:flex-col lg:justify-start lg:border-r lg:border-t-0" aria-label="Narzędzia">
          {ORDER.map((id) => (
            <button key={id} onClick={() => pick(id)} aria-pressed={s.panel === id && s.panelOpen} title={PANEL_TITLES[id]}
              className={`flex min-w-[56px] flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[9.5px] uppercase tracking-wider transition lg:flex-none lg:py-3.5 ${s.panel === id && s.panelOpen ? "bg-botanic text-sage lg:border-l-2 lg:border-sage" : "text-[#9aa79b] hover:bg-[#182019] hover:text-white lg:border-l-2 lg:border-transparent"}`}>
              <Icon d={ICONS[id]} />{PANEL_TITLES[id]}
            </button>
          ))}
        </nav>

        {/* settings panel */}
        {s.panelOpen && (
          <aside className="scroll-thin z-20 max-h-[46vh] shrink-0 overflow-y-auto border-t border-[#243029] bg-[#121714] p-4 lg:max-h-none lg:w-[320px] lg:border-r lg:border-t-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl text-white">{PANEL_TITLES[s.panel]}</h2>
              <button className="text-stone hover:text-white lg:hidden" aria-label="Zamknij panel" onClick={() => s.set({ panelOpen: false })}>✕</button>
            </div>
            <PanelContent id={s.panel} />
          </aside>
        )}

        {/* canvas */}
        <main className="relative flex min-h-[280px] min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div className={`absolute inset-0 transition-all duration-500 ${s.mode === "2d" ? "opacity-100" : "pointer-events-none scale-[1.03] opacity-0"}`}><PlanEditor /></div>
            {mount3d && (
              <div className={`absolute inset-0 transition-all duration-500 ${s.mode === "3d" ? "opacity-100" : "pointer-events-none scale-[0.98] opacity-0"}`}>
                <Scene3D project={s.project} view={s.view3d} nonce={s.cameraNonce} quality={s.settings.quality} visible={s.mode === "3d" || s.summaryOpen} captureRef={captureRef} />
              </div>
            )}

            {/* 2D/3D toggle */}
            <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 border border-[#33403a] bg-[#101411]/95 shadow-lg" role="tablist" aria-label="Tryb widoku">
              {(["2d", "3d"] as const).map((m) => (
                <button key={m} role="tab" aria-selected={s.mode === m} onClick={() => setMode(m)} className={`px-4 py-2 text-[11px] font-medium uppercase tracking-[.16em] transition ${s.mode === m ? "bg-sage text-charcoal" : "text-[#cfd8cf] hover:bg-botanic"}`}>{m === "2d" ? "2D Plan" : "Widok 3D"}</button>
              ))}
            </div>

            {s.mode === "3d" && (
              <>
                <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5 border border-[#2a342e] bg-[#101411]/92 p-2">
                  {([["perspective", "Perspektywa"], ["top", "Z góry"], ["eye", "Poziom oczu"]] as const).map(([id, n]) => (
                    <button key={id} className={`pl-btn ${s.view3d === id ? "!border-sage !text-sage" : ""}`} onClick={() => view(id)}>{n}</button>
                  ))}
                  <button className="pl-btn" onClick={() => view(s.view3d)}>Reset kamery</button>
                </div>
                <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 border border-[#2a342e] bg-[#101411]/92 p-2">
                  <Seg<Lighting> value={s.project.lighting} onChange={(v) => s.patchProject({ lighting: v })} options={[{ id: "day", name: "Dzień" }, { id: "golden", name: "Złota godz." }, { id: "evening", name: "Wieczór" }]} />
                  <Seg value={s.settings.quality} onChange={(v) => s.setSettings({ quality: v })} options={[{ id: "high", name: "Jakość: wysoka" }, { id: "low", name: "Oszczędna" }]} />
                </div>
                <div className="pointer-events-none absolute bottom-3 right-3 z-10 hidden max-w-[260px] text-right text-[10.5px] leading-snug text-white/70 sm:block">Przeciągnij — obrót · scroll — zoom · prawy przycisk — przesuwanie. Edycję obiektów wykonasz w 2D; 3D zawsze odzwierciedla ten sam projekt.{lowDevice && " Włączono oszczędną jakość."}</div>
              </>
            )}
            {s.toast && <div role="status" className="absolute bottom-16 left-1/2 z-30 max-w-[90%] -translate-x-1/2 border border-sage/60 bg-charcoal px-4 py-2 text-[12px] text-sage shadow-xl">{s.toast}</div>}
          </div>
          {s.mode === "2d" && <div className="h-[104px] shrink-0 border-t border-[#243029] bg-[#101411]"><PropertiesBar /></div>}
        </main>
        {s.summaryOpen && <Summary />}
        {s.welcome && <Welcome />}
      </div>
    </div>
  );
}
