import Link from "next/link";
export const metadata = { title: "Jak układamy kostkę: podjazdy, tarasy, ścieżki, place — NAZWA MARKI [miasto]", description: "Etapy układania kostki brukowej od oglądania terenu po odbiór oraz to, na co zwracamy uwagę przy podjazdach, tarasach, ścieżkach i placach." };

const STAGES: [string, string, string][] = [
  ["1.0", "oglądamy teren", "Przyjeżdżamy, mierzymy powierzchnię i sprawdzamy grunt, spadki oraz dojazd dla sprzętu. Ustalamy, co ma być położone i którędy spłynie woda."],
  ["2.0", "wykop i podbudowa", "Zdejmujemy warstwę gruntu i układamy kruszywo warstwami, zagęszczając każdą z nich. Grubość zależy od gruntu i obciążenia: inna pod ścieżką, inna pod samochodem."],
  ["3.0", "obrzeża i podsypka", "Ustawiamy obrzeża, które trzymają krawędź, i rozkładamy podsypkę wyrównaną do spadku."],
  ["4.0", "układanie", "Kładziemy kostkę we wzorze i tniemy ją przy krawędziach. Wzór i kolor wybierasz wcześniej, możesz je przymierzyć w wizualizatorze."],
  ["5.0", "fugowanie i zagęszczanie", "Wsypujemy materiał w spoiny i zagęszczamy całość. Dopiero wtedy nawierzchnia pracuje jak jedna płyta."],
  ["6.0", "odbiór", "Sprawdzamy spadki i krawędzie, sprzątamy teren. [do uzupełnienia: co klient dostaje po odbiorze]"],
];
const SURFACES: [string, string, string][] = [
  ["podjazdy", "podjazdy i wjazdy", "Najczęstsza praca. Dobieramy szerokość pod samochody, spadek od domu i wzór, który nie męczy oka."],
  ["tarasy", "tarasy", "Płyty lub kostka przy domu. Najpierw spadek od ściany i odpływ wody, dopiero potem wzór."],
  ["sciezki", "ścieżki i chodniki", "Od furtki do drzwi i dookoła domu. Równe, antypoślizgowe, z obrzeżem, które trzyma kształt."],
  ["place", "place i parkingi", "Większe obciążenia wymagają grubszej podbudowy i innej kostki. Liczymy to dla Twojego gruntu."],
  ["obrzeza", "obrzeża, schody, opaski", "Elementy, których nie widać z daleka, a które decydują, jak nawierzchnia zachowa się po latach."],
];

export default function Page() {
  return (
    <>
      <section className="pad pb-[clamp(4rem,8vw,7rem)] pt-[clamp(2.5rem,4.5vw,4rem)]">
        <h1 className="display max-w-[16ch]">jak układamy kostkę<span className="period" aria-hidden /></h1>
        <p className="prose-m mt-8 text-[var(--text-lg)] leading-snug">Sześć etapów, w tej kolejności. [opis etapów do potwierdzenia przez firmę]</p>
      </section>

      {STAGES.map(([n, t, d]) => (
        <section key={n} className="stage py-[clamp(2.5rem,6vw,5rem)]">
          <div className="grid grid-cols-6 items-start gap-y-4 pad md:grid-cols-12">
            <p className="stage-num col-span-6 md:col-span-4" aria-hidden>{n}</p>
            <h2 className="h2 col-span-6 md:col-span-4">{t}</h2>
            <p className="prose-m col-span-6 md:col-span-4">{d}</p>
          </div>
        </section>
      ))}

      <section className="band">
        <h2 className="h2 pad">na co patrzymy przy…</h2>
        <div className="mt-10 border-b border-[var(--color-ink)]">
          {SURFACES.map(([id, t, d]) => (
            <div key={id} id={id} className="grid scroll-mt-20 grid-cols-6 gap-y-2 border-t border-[var(--color-rule)] pad py-6 md:grid-cols-12">
              <h3 className="h2 col-span-6 md:col-span-6">{t}</h3>
              <p className="prose-m col-span-6 md:col-span-5 md:col-start-8">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="grid grid-cols-6 items-end gap-y-6 pad md:grid-cols-12">
          <h2 className="h2 col-span-6 md:col-span-7">nie wiesz, jaką kostkę wybrać?</h2>
          <div className="col-span-6 flex flex-wrap gap-3 md:col-span-5 md:justify-end">
            <Link href="/wizualizator" className="btn btn-signal">przymierz kostkę na zdjęciu</Link>
            <a href="tel:+48000000000" className="btn btn-line">zadzwoń&nbsp;[telefon]</a>
          </div>
        </div>
      </section>
    </>
  );
}
