import Link from "next/link";
import { Specimens } from "@/components/marketing/Specimens";
import { GroupHead, GRASS_IMGS, PAVER_IMGS } from "@/components/marketing/GroupHead";
import { PlannerShowcase } from "@/components/marketing/PlannerShowcase";
import { Faq } from "@/components/marketing/Faq";
import { ContactForm } from "@/components/marketing/ContactForm";
import { VisualizerLoader } from "@/components/visualizer/VisualizerLoader";

const PAVING: [string, string, string][] = [
  ["podjazdy i wjazdy", "Szerokość pod samochody, spadek odprowadzający wodę od domu, krawędź, która się nie rozjeżdża.", "podjazdy"],
  ["tarasy", "Płyty lub kostka przy domu, na stabilnej podbudowie i z odpływem wody.", "tarasy"],
  ["ścieżki i chodniki", "Od furtki do drzwi i dookoła domu: równo i antypoślizgowo.", "sciezki"],
  ["place i parkingi", "Większe powierzchnie pod obciążenie, z grubszą podbudową.", "place"],
  ["obrzeża, schody, opaski", "Wykończenia, od których zależy, jak nawierzchnia trzyma się latami.", "obrzeza"],
];
const GARDEN: [string, string, string][] = [
  ["trawniki", "Przygotowanie gruntu i założenie trawnika z rolki albo z siewu.", "trawniki"],
  ["rabaty i nasadzenia", "Drzewa, krzewy, żywopłoty i byliny dobrane do miejsca i do tego, ile czasu masz na pielęgnację.", "nasadzenia"],
  ["projekt ogrodu", "Układ stref, ścieżek i zieleni, od szkicu do realizacji.", "projekt"],
  ["ogrodzenia i murki", "Ogrodzenie, opornik, murek oporowy tam, gdzie teren tego wymaga.", "ogrodzenia"],
  ["oświetlenie ogrodowe", "Światło przy ścieżkach, wejściu i tarasie.", "oswietlenie"],
];

function Links({ rows }: { rows: [string, string, string][] }) {
  return (
    <ul>
      {rows.map(([t, , id]) => (
        <li key={id}>
          <Link href={`/uslugi#${id}`} className="irow">
            <span className="pad flex items-center justify-between py-4">
              <span className="h3 slide" style={{ fontSize: "clamp(1.25rem, 2vw, 1.6rem)" }}>{t}</span>
              <span aria-hidden>→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <>
      <section>
        <div className="grid grid-cols-6 md:grid-cols-12">
          <div className="col-span-6 pad pb-[clamp(4rem,8vw,7rem)] pt-[clamp(2.5rem,4.5vw,4rem)] md:col-span-7">
            <h1 className="display-m">kostka brukowa i ogrody<span className="period" aria-hidden /></h1>
            <p className="prose-m mt-8 text-[var(--text-lg)] leading-snug">
              Podjazdy, tarasy i ścieżki z każdej kostki. Trawniki, rabaty i całe ogrody, od projektu po nasadzenia. Białystok i okolice
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="tel:+48885879108" className="btn btn-signal">zadzwoń&nbsp;885&nbsp;879&nbsp;108</a>
              <a href="#wizualizator" className="btn btn-line">przymierz&nbsp;↓</a>
            </div>
          </div>
          <div className="col-span-6 border-[var(--color-ink)] md:col-span-5 md:border-l">
            <Specimens />
          </div>
        </div>
      </section>

      <section id="wizualizator" className="band">
        <div className="grid grid-cols-6 gap-y-6 pad md:grid-cols-12">
          <h2 className="h2 col-span-6 md:col-span-7">przymierz kostkę lub trawnik na swoim zdjęciu.</h2>
          <p className="prose-m col-span-6 md:col-span-4 md:col-start-9">Wgraj zdjęcie podjazdu, tarasu albo ogrodu, zaznacz cztery rogi i wybierz materiał. Zdjęcie zostaje w Twojej przeglądarce. Nigdzie go nie wysyłamy.</p>
        </div>
        <div className="mt-10 border-y border-[var(--color-ink)] pad py-6"><VisualizerLoader /></div>
      </section>

      <section id="planer" className="band">
        <div className="grid grid-cols-6 gap-y-6 pad md:grid-cols-12">
          <h2 className="h2 col-span-6 md:col-span-7">planer ogrodu.</h2>
          <p className="prose-m col-span-6 md:col-span-4 md:col-start-9">Plan 2D i model 3D tej samej działki. Ustaw dom, narysuj ścieżkę, trawnik i rabaty, dodaj drzewa. Planer sam liczy, ile kostki i trawnika potrzeba.</p>
        </div>
        <div className="mt-10"><PlannerShowcase /></div>
      </section>


      <section id="uslugi" className="band">
        <h2 className="h2 pad">co robimy.</h2>
        <div className="mt-10 grid md:grid-cols-2">
          <div>
            <GroupHead title="kostka brukowa" imgs={PAVER_IMGS} compact />
            <Links rows={PAVING} />
          </div>
          <div className="mt-10 md:mt-0 md:border-l md:border-[var(--color-ink)]">
            <GroupHead title="ogrody" imgs={GRASS_IMGS} compact />
            <Links rows={GARDEN} />
          </div>
        </div>
        <p className="pad mt-6"><Link href="/uslugi" className="btn btn-line">jak pracujemy</Link></p>
      </section>

      <section className="band">
        <div className="grid grid-cols-6 gap-y-8 pad md:grid-cols-12">
          <h2 className="h2 col-span-6 md:col-span-5">pytania, które słyszymy.</h2>
          <div className="col-span-6 md:col-span-6 md:col-start-7"><Faq /></div>
        </div>
      </section>

      <section id="kontakt" className="band">
        <div className="grid grid-cols-6 gap-y-10 pad md:grid-cols-12">
          <div className="col-span-6 md:col-span-6">
            <h2 className="h2">poproś o kontakt.</h2>
            <p className="prose-m mt-4">Zostaw numer. Odezwiemy się w godzinach pracy i umówimy oglądanie terenu.</p>
            <div className="mt-8 max-w-[32rem]"><ContactForm /></div>
          </div>
        </div>
      </section>
    </>
  );
}
