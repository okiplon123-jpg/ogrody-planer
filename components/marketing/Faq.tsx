const QA: [string, string][] = [
  ["Ile trwa położenie podjazdu?", "Zależy od rodzaju robót i wielkości zlecenia. Zazwyczaj jest to około 2 tygodnie."],
  ["Czy można układać kostkę zimą?", "Zimą staramy się kostki nie układać. Wszystko zależy jednak od pogody, więc termin ustalamy, gdy widzimy, jakie są warunki."],
  ["Czy potrzebuję pozwolenia?", "Nie, na samo położenie kostki pozwolenie nie jest potrzebne."],
  ["Jak przygotować teren?", "Nie musisz nic przygotowywać. Teren przygotowujemy my."],
  ["Od czego zależy cena?", "Zależy od powierzchni, gruntu, grubości podbudowy, wybranej kostki, odwodnienia i dojazdu dla sprzętu."],
  ["Jaką kostkę układacie?", "Każdą: betonową, granitową, klinkierową, kamienną, w każdym kolorze i wzorze. Możesz też przymierzyć ją najpierw na własnym zdjęciu w wizualizatorze."],
  ["Czy zakładacie ogród od zera?", "Tak, ogród zakładamy od zera: od projektu i prac ziemnych po trawnik, rabaty i nasadzenia."],
  ["Czy jest gwarancja?", "Tak. Jeśli po wykonaniu prac coś się wydarzy, wracamy i to naprawiamy. [do uzupełnienia: okres gwarancji]"],
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
