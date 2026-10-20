import Link from "next/link";
import { GroupHead, GRASS_IMGS, PAVER_IMGS } from "@/components/marketing/GroupHead";
export const metadata = { title: "Kostka brukowa i ogrody: jak pracujemy — NAZWA MARKI [miasto]", description: "Etapy układania kostki brukowej i zakładania ogrodu: od oglądania terenu po odbiór. Podjazdy, tarasy, ścieżki, trawniki, rabaty i nasadzenia." };

const PAVING_STAGES: [string, string, string][] = [
  ["1.0", "oglądamy teren", "Mierzymy powierzchnię i sprawdzamy grunt, spadki oraz dojazd dla sprzętu. Ustalamy, co ma być położone i którędy spłynie woda."],
  ["2.0", "wykop i podbudowa", "Zdejmujemy warstwę gruntu i układamy kruszywo warstwami, zagęszczając każdą z nich. Grubość zależy od gruntu i obciążenia."],
  ["3.0", "obrzeża i podsypka", "Ustawiamy obrzeża, które trzymają krawędź, i rozkładamy podsypkę wyrównaną do spadku."],
  ["4.0", "układanie i fugowanie", "Kładziemy kostkę we wzorze, tniemy ją przy krawędziach, wsypujemy materiał w spoiny i zagęszczamy całość."],
  ["5.0", "odbiór", "Sprawdzamy spadki i krawędzie, sprzątamy teren. [do uzupełnienia: co klient dostaje po odbiorze]"],
];
const GARDEN_STAGES: [string, string, string][] = [
  ["1.0", "oglądamy działkę", "Sprawdzamy nasłonecznienie, grunt, spadki i to, jak korzystasz z ogrodu. [do uzupełnienia przez firmę]"],
  ["2.0", "projekt", "Układamy strefy: trawnik, rabaty, ścieżki, miejsce na taras. Możesz zacząć od własnego szkicu w planerze ogrodu."],
  ["3.0", "prace ziemne i odwodnienie", "Niwelacja, poprawa gruntu i odprowadzenie wody tam, gdzie to potrzebne. [do uzupełnienia przez firmę]"],
  ["4.0", "trawnik, rabaty, nasadzenia", "Zakładamy trawnik z rolki albo z siewu, sadzimy drzewa, krzewy i byliny zgodnie z projektem."],
  ["5.0", "odbiór i pielęgnacja", "Przekazujemy ogród i mówimy, jak go pielęgnować. [do uzupełnienia: czy firma oferuje opiekę po realizacji]"],
];

const PAVING: [string, string, string][] = [
  ["podjazdy", "podjazdy i wjazdy", "Dobieramy szerokość pod samochody, spadek od domu i wzór, który nie męczy oka."],
  ["tarasy", "tarasy", "Płyty lub kostka przy domu. Najpierw spadek od ściany i odpływ wody, dopiero potem wzór."],
  ["sciezki", "ścieżki i chodniki", "Od furtki do drzwi i dookoła domu. Równe, antypoślizgowe, z obrzeżem, które trzyma kształt."],
  ["place", "place i parkingi", "Większe obciążenia wymagają grubszej podbudowy i innej kostki. Układamy każdy rodzaj kostki."],
  ["obrzeza", "obrzeża, schody, opaski", "Elementy, których nie widać z daleka, a które decydują, jak nawierzchnia zachowa się po latach."],
];
const GARDEN: [string, string, string][] = [
  ["trawniki", "trawniki", "Z rolki albo z siewu, na przygotowanym podłożu."],
  ["nasadzenia", "rabaty i nasadzenia", "Drzewa, krzewy, żywopłoty i byliny. Rośliny dobieramy do miejsca, nie do katalogowego zdjęcia."],
  ["projekt", "projekt ogrodu", "Układ stref i zieleni dopasowany do działki i do tego, jak z niej korzystasz."],
  ["ogrodzenia", "ogrodzenia i murki", "Ogrodzenie, opornik, murek oporowy tam, gdzie teren tego wymaga."],
  ["oswietlenie", "oświetlenie ogrodowe", "Światło przy ścieżkach, wejściu i tarasie."],
];

function Stages({ title, stages, imgs }: { title: string; stages: [string, string, string][]; imgs: string[] }) {
  return (
    <>
      <div className="mt-16"><GroupHead title={title} imgs={imgs} /></div>
      {stages.map(([n, t, d]) => (
        <section key={title + n} className="stage py-[clamp(2.5rem,6vw,5rem)]">
          <div className="grid grid-cols-6 items-start gap-y-4 pad md:grid-cols-12">
            <p className="stage-num col-span-6 md:col-span-4" aria-hidden>{n}</p>
            <h3 className="h2 col-span-6 md:col-span-4">{t}</h3>
            <p className="prose-m col-span-6 md:col-span-4">{d}</p>
          </div>
        </section>
      ))}
    </>
  );
}
function Rows({ title, rows, imgs }: { title: string; rows: [string, string, string][]; imgs: string[] }) {
  return (
    <div className="mt-12 first:mt-10">
      <GroupHead title={title} imgs={imgs} />
      {rows.map(([id, t, d], i) => (
        <div key={id} id={id} className="grid scroll-mt-20 grid-cols-6 items-baseline gap-y-2 border-b border-[var(--color-rule)] pad py-5 md:grid-cols-12 md:py-6">
          <p className="label col-span-1 md:col-span-1" aria-hidden>{String(i + 1).padStart(2, "0")}</p>
          <h4 className="h3 col-span-5 md:col-span-5" style={{ fontSize: "clamp(1.4rem, 2.6vw, 2rem)" }}>{t}</h4>
          <p className="prose-m col-span-6 md:col-span-5 md:col-start-8">{d}</p>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <>
      <section className="pad pb-[clamp(4rem,8vw,7rem)] pt-[clamp(2.5rem,4.5vw,4rem)]">
        <h1 className="display-m max-w-[18ch]">jak pracujemy<span className="period" aria-hidden /></h1>
        <p className="prose-m mt-8 text-[var(--text-lg)] leading-snug">Kostka brukowa i ogrody: dwa rodzaje prac, każdy w swojej kolejności. [opis etapów do potwierdzenia przez firmę]</p>
      </section>

      <Stages title="kostka brukowa" stages={PAVING_STAGES} imgs={PAVER_IMGS} />
      <Stages title="ogrody" stages={GARDEN_STAGES} imgs={GRASS_IMGS} />

      <section className="band">
        <h2 className="h2 pad">na co patrzymy.</h2>
        <Rows title="przy kostce" rows={PAVING} imgs={PAVER_IMGS} />
        <Rows title="przy ogrodzie" rows={GARDEN} imgs={GRASS_IMGS} />
      </section>

      <section className="band">
        <div className="grid grid-cols-6 items-end gap-y-6 pad md:grid-cols-12">
          <h2 className="h2 col-span-6 md:col-span-6">zobacz to u siebie.</h2>
          <div className="col-span-6 flex flex-wrap gap-3 md:col-span-6 md:justify-end">
            <Link href="/wizualizator" className="btn btn-signal">przymierz kostkę</Link>
            <Link href="/planer" className="btn btn-line">planer ogrodu</Link>
            <a href="tel:+48000000000" className="btn btn-line">zadzwoń&nbsp;[telefon]</a>
          </div>
        </div>
      </section>
    </>
  );
}
