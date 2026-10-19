const QA: [string, string][] = [
  ["Ile trwa położenie podjazdu?", "[do uzupełnienia przez firmę: typowy czas dla podjazdu, tarasu i ścieżki oraz od czego zależy]"],
  ["Czy można układać kostkę zimą?", "[do uzupełnienia przez firmę: kiedy pracujecie w sezonie i od jakich warunków pogodowych to zależy]"],
  ["Czy potrzebuję pozwolenia?", "[do uzupełnienia przez firmę: czy sprawdzacie wymogi formalne dla klienta i jak to robicie. Przepisy zależą od rodzaju prac i miejsca, np. zjazdu z drogi publicznej]"],
  ["Jak przygotować teren?", "[do uzupełnienia przez firmę: co klient musi przygotować, a co jest po Waszej stronie]"],
  ["Od czego zależy cena?", "Zależy od powierzchni, gruntu, grubości podbudowy, wybranej kostki, odwodnienia i dojazdu dla sprzętu. [do uzupełnienia: jak firma ustala kwotę]"],
  ["Jaką kostkę układacie?", "Każdą: betonową, granitową, klinkierową, kamienną, w każdym kolorze i wzorze. Możesz też przymierzyć ją najpierw na własnym zdjęciu w wizualizatorze."],
  ["Czy zakładacie ogród od zera?", "[do uzupełnienia przez firmę: czy robicie projekt, prace ziemne, trawnik, rabaty i nasadzenia w jednym zleceniu, i od czego zależy zakres]"],
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
