"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { summarize } from "@/lib/summary";
import { fmtArea } from "@/lib/geometry";
import { PlanLayer } from "./PlanLayer";

export function Summary() {
  const s = useStore();
  const { project, settings } = s;
  const sum = useMemo(() => summarize(project, settings.waste), [project, settings.waste]);
  const [notes, setNotes] = useState("");
  const rows: [string, number, string][] = [
    ["Podjazd", sum.driveway, "#3a3d40"], ["Taras", sum.terrace, "#9b9d9b"], ["Ścieżki", sum.path, "#8c8f90"],
    ["Inne nawierzchnie", sum.other, "#b9a07c"], ["Trawnik", sum.lawn, "#5f8d3d"], ["Rabaty", sum.beds, "#6d4a30"],
  ];
  const total = rows.reduce((a, r) => a + r[1], 0) || 1;
  const download = () => {
    if (!s.preview3d) { s.notify("Najpierw otwórz widok 3D — zrzut zostanie wygenerowany z aktualnej sceny."); return; }
    const a = document.createElement("a"); a.href = s.preview3d; a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}-wizualizacja.png`; a.click();
  };
  return (
    <div className="absolute inset-0 z-40 overflow-y-auto bg-charcoal/95 backdrop-blur-sm" role="dialog" aria-label="Podsumowanie projektu">
      <div className="mx-auto max-w-[1180px] px-5 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div><div className="eyebrow text-sage">Podsumowanie projektu</div><h2 className="font-serif text-4xl text-white">{project.name}</h2></div>
          <button className="pl-btn" onClick={() => s.set({ summaryOpen: false })}>← Wróć do planera</button>
        </div>
        <div className="grid gap-6">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-[#2a342e] bg-[#161c18]">
                <div className="pl-label px-3 py-2">Plan 2D</div>
                <svg viewBox={`-2 -2 ${project.plot.w + 4} ${project.plot.l + 12}`} className="block w-full bg-[#1a211d]"><PlanLayer project={project} /></svg>
              </div>
              <div className="border border-[#2a342e] bg-[#161c18]">
                <div className="pl-label px-3 py-2">Widok 3D</div>
                {s.preview3d ? <img src={s.preview3d} alt="Wizualizacja 3D projektu" className="block w-full" /> : <div className="flex aspect-[3/4] items-center justify-center p-4 text-center text-[12px] text-stone">Przygotowuję podgląd 3D… Jeśli się nie pojawi, przełącz na „Widok 3D” i wróć tutaj.</div>}
              </div>
            </div>
            <div className="border border-[#2a342e] bg-[#161c18] p-4">
              <div className="pl-label mb-3">Zestawienie powierzchni (liczone z geometrii projektu)</div>
              <div className="mb-3 flex h-3 w-full overflow-hidden">{rows.map(([n, a, c]) => a > 0 && <div key={n} title={n} style={{ width: `${(a / total) * 100}%`, background: c }} />)}</div>
              <table className="w-full text-[13px]"><tbody>
                {rows.map(([n, a, c]) => (
                  <tr key={n} className="border-t border-[#232d27]"><td className="py-1.5"><span className="mr-2 inline-block h-2.5 w-2.5" style={{ background: c }} />{n}</td><td className="py-1.5 text-right tabular-nums text-white">{fmtArea(a)}</td></tr>
                ))}
                <tr className="border-t border-[#33403a] text-stone"><td className="py-1.5">Działka (całość)</td><td className="py-1.5 text-right tabular-nums">{fmtArea(sum.plot)}</td></tr>
              </tbody></table>
              <div className="pl-label mb-2 mt-5">Ilości materiałów (szacunek) (zapas {settings.waste}%)</div>
              {sum.byMaterial.length ? <table className="w-full text-[13px]"><tbody>
                {sum.byMaterial.map((m) => <tr key={m.id} className="border-t border-[#232d27]"><td className="py-1.5">{m.name}</td><td className="py-1.5 text-right tabular-nums text-stone">{fmtArea(m.area)}</td><td className="py-1.5 text-right tabular-nums text-white">{fmtArea(m.withWaste)}</td></tr>)}
              </tbody></table> : <p className="text-[12px] text-stone">Brak nawierzchni w projekcie.</p>}
              <p className="mt-4 text-[11px] leading-relaxed text-stone">Wartości są szacunkowe i wynikają wyłącznie z narysowanego planu (nakładające się obszary nie są odejmowane).</p>
              <p className="mt-2 text-[11px] text-stone">Drzewa: {sum.counts.trees} · krzewy i trawy: {sum.counts.shrubs} · lampy: {sum.counts.lights}</p>
            </div>
            <label className="block"><span className="pl-label mb-1 block">Uwagi do projektu (opcjonalnie)</span><textarea className="pl-input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Np. preferowany kolor kostki, istniejące drzewa do zachowania…" /></label>
            <div className="flex flex-wrap gap-2">
              <button className="pl-btn pl-btn-primary" onClick={s.save}>Zapisz projekt</button>
              <button className="pl-btn" onClick={download}>Pobierz wizualizację</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
