const QA: [string, string][] = [
  ["Ile trwa położenie podjazdu?", "To zależy od metrażu, gruntu i pogody, więc nie podamy jednej liczby przez telefon. Po obejrzeniu terenu mówimy konkretnie. [do uzupełnienia: typowe czasy]"],
  ["Czy można układać kostkę zimą?", "Wykop, podbudowa i układanie potrzebują niezamarzniętego gruntu i dodatnich temperatur. [do uzupełnienia: kiedy firma pracuje w sezonie]"],
  ["Czy potrzebuję pozwolenia?", "Zwykły podjazd lub chodnik na własnej działce zazwyczaj go nie wymaga. Inaczej bywa przy zjeździe z drogi publicznej i przy ogrodzeniu. Sprawdzimy to dla Twojej działki."],
  ["Jak przygotować teren?", "Zostaw dojazd dla sprzętu i usuń rzeczy z miejsca prac. Wykop i podbudowa są po naszej stronie."],
  ["Od czego zależy cena?", "Od powierzchni, rodzaju gruntu, grubości podbudowy, wybranej kostki i wzoru, odwodnienia oraz dojazdu sprzętu. Dokładną kwotę ustalamy na miejscu."],
  ["Czy jest gwarancja?", "[do uzupełnienia przez firmę — nic nie wpisujemy, dopóki nie jest potwierdzone]"],
];

export function Faq() {
  return (
    <div className="faq">
      {QA.map(([q, a], i) => (
        <details key={q} open={i === 0}>
          <summary>{q}<span className="tog" aria-hidden /></summary>
          <p className="prose-m pb-6 pr-10 text-[var(--color-ink-2)]">{a}</p>
        </details>
      ))}
    </div>
  );
}
