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
  const rows: [string, string, boolean][] = [
    ["Kostka i nawierzchnie", fmtM2(sum.paved), true],
    ["z zapasem " + waste + "%", fmtM2(sum.paved * k), false],
    ["Trawnik", fmtM2(sum.lawn), true],
    ["Rabaty", fmtM2(sum.beds), true],
    ["Obrzeża", sum.edging ? fmtM(sum.edging) : "—", true],
    ["Ogrodzenie", sum.fence ? fmtM(sum.fence) : "—", true],
    ["Żywopłot", sum.hedge ? fmtM(sum.hedge) : "—", true],
  ];
  const plants = sum.counts.trees + sum.counts.shrubs + sum.counts.grasses;
  return (
    <section aria-label="Zestawienie materiałów" className="border-t border-[var(--color-ink)] pt-4">
      <h2 className="text-[11px] uppercase tracking-wider text-[var(--color-ink)]">Ile czego (na bieżąco)</h2>
      <dl className="mt-2 text-[13px]">
        {rows.map(([k2, v, main]) => (
          <div key={k2} className={`flex items-baseline justify-between gap-3 py-1 ${main ? "border-t border-[var(--color-rule)]" : "text-[var(--color-muted)]"}`}>
            <dt className={main ? "" : "pl-3 text-[12px]"}>{k2}</dt><dd className="tnum font-semibold">{v}</dd>
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
    </section>
  );
}
