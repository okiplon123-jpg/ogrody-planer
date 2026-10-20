"use client";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { fmtM, fmtM2, fmtM3, summarize } from "@/lib/summary";

/** Live material take-off, recomputed from the plan on every change. */
export function Quantities() {
  const project = useStore((s) => s.project);
  const waste = useStore((s) => s.settings.waste);
  const sum = useMemo(() => summarize(project, waste), [project, waste]);
  const k = 1 + waste / 100;
  const main: [string, string][] = [["Kostka i nawierzchnie", fmtM2(sum.paved)], ["Trawnik", fmtM2(sum.lawn)], ["Rabaty", fmtM2(sum.beds)]];
  const more: [string, string][] = [
    ["Kostka z zapasem " + waste + "%", fmtM2(sum.paved * k)],
    ["Obrzeża", sum.edging ? fmtM(sum.edging) : "—"],
    ["Ogrodzenie", sum.fence ? fmtM(sum.fence) : "—"],
    ["Żywopłot", sum.hedge ? fmtM(sum.hedge) : "—"],
  ];
  const plants = sum.counts.trees + sum.counts.shrubs + sum.counts.grasses;
  return (
    <section aria-label="Zestawienie materiałów" className="border-t border-[var(--color-ink)] pt-4">
      <h2 className="text-[11px] uppercase tracking-wider text-[var(--color-ink)]">Ile czego (na bieżąco)</h2>
      <dl className="mt-2 text-[13px]">
        {main.map(([k2, v]) => (
          <div key={k2} className="flex items-baseline justify-between gap-3 border-t border-[var(--color-rule)] py-1">
            <dt>{k2}</dt><dd className="tnum font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <details className="group mt-1">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-[11px] uppercase tracking-wider text-[var(--color-ink-2)]">Szczegóły<span aria-hidden className="text-base transition group-open:rotate-45">+</span></summary>
        <dl className="text-[13px]">
          {more.map(([k2, v]) => (
            <div key={k2} className="flex items-baseline justify-between gap-3 border-t border-[var(--color-rule)] py-1">
              <dt className="text-[var(--color-ink-2)]">{k2}</dt><dd className="tnum font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      {sum.byMaterial.length > 0 && (
        <ul className="mt-2 border-t border-[var(--color-rule)] pt-2 text-[12px] text-[var(--color-ink-2)]">
          {sum.byMaterial.map((m) => <li key={m.id} className="flex justify-between gap-3 py-0.5"><span>{m.name}</span><span className="tnum">{fmtM2(m.area)}</span></li>)}
        </ul>
      )}
      <p className="mt-2 text-[11px] leading-snug text-[var(--color-muted)]">
        Rośliny: {plants} szt. (drzewa {sum.counts.trees}, krzewy {sum.counts.shrubs}, trawy {sum.counts.grasses}){sum.mulchM3 > 0 ? ` · kora ok. ${fmtM3(sum.mulchM3)} przy warstwie 5 cm` : ""}. Szacunek z narysowanego planu, nakładające się obszary nie są odejmowane.
      </p>
      </details>
    </section>
  );
}
