"use client";
import { useState } from "react";
const QA: [string, string][] = [
  ["Ile trwa położenie podjazdu?", "To zależy od metrażu, gruntu i pogody. Czas podamy po obejrzeniu terenu. [do uzupełnienia przez firmę: typowe czasy]"],
  ["Czy kostkę można układać zimą?", "Prace ziemne i układanie wymagają dodatnich temperatur i niezamarzniętego gruntu. [do uzupełnienia: sezon pracy firmy]"],
  ["Czy potrzebne jest zezwolenie?", "Zwykle zwykły podjazd czy chodnik na własnej działce nie wymaga pozwolenia na budowę, ale przy zjazdach z drogi publicznej i ogrodzeniach wymogi bywają inne. Sprawdzimy to przy konkretnej działce."],
  ["Jak przygotować teren?", "Wystarczy zostawić dostęp dla sprzętu i usunąć rzeczy z obszaru prac. Resztą (wykop, podbudowa) zajmujemy się my."],
  ["Od czego zależy cena?", "Od powierzchni, rodzaju gruntu, grubości podbudowy, wybranej kostki i wzoru, odwodnienia oraz dojazdu sprzętu. Dokładną kwotę ustalamy po obejrzeniu miejsca."],
  ["Czy dajecie gwarancję?", "[do uzupełnienia przez firmę — nie wpisujemy nic, czego firma nie potwierdzi]"],
];
export function Faq() {
  const [o, setO] = useState<number | null>(0);
  return (
    <div className="border-t-[1.5px] border-ink">
      {QA.map(([q, a], i) => (
        <div key={q} className="border-b-[1.5px] border-ink">
          <button className="flex w-full items-center justify-between gap-6 py-5 text-left font-serif text-2xl md:text-3xl" aria-expanded={o === i} onClick={() => setO(o === i ? null : i)}>
            {q}<span className="eyebrow text-rust">{o === i ? "−" : "+"}</span>
          </button>
          {o === i && <p className="max-w-3xl pb-6 text-lg leading-relaxed text-ink/75">{a}</p>}
        </div>
      ))}
    </div>
  );
}
