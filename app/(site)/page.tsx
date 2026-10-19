import Link from "next/link";
import { Specimens } from "@/components/marketing/Specimens";
import { Faq } from "@/components/marketing/Faq";
import { ContactForm } from "@/components/marketing/ContactForm";
import { VisualizerLoader } from "@/components/visualizer/VisualizerLoader";

const WORK: [string, string, string][] = [
  ["podjazdy i wjazdy", "Szerokość pod samochody, spadek odprowadzający wodę od domu, krawędź, która się nie rozjeżdża.", "podjazdy"],
  ["tarasy", "Płyty lub kostka przy domu, na stabilnej podbudowie i z odpływem wody.", "tarasy"],
  ["ścieżki i chodniki", "Od furtki do drzwi i dookoła domu: równo i antypoślizgowo.", "sciezki"],
  ["place i parkingi", "Większe powierzchnie pod obciążenie, z grubszą podbudową.", "place"],
  ["obrzeża, schody, opaski", "Wykończenia, od których zależy, jak nawierzchnia trzyma się latami.", "obrzeza"],
];

const LAYERS: [string, string, string, string][] = [
  ["widać", "kostka lub płyta", "Wzór i kolor wybierasz do domu. Możesz go przymierzyć na własnym zdjęciu, zanim cokolwiek zamówimy.", "var(--color-ink-2)"],
  ["osadzenie", "podsypka", "Cienka warstwa, w której leży kostka. Wyrównujemy ją do spadku, bo to ona decyduje, czy woda spłynie.", "var(--color-accent)"],
  ["nośność", "podbudowa", "Kruszywo zagęszczane warstwami. Grubość zależy od gruntu i obciążenia: inna pod ścieżką, inna pod samochodem.", "var(--color-rule)"],
  ["grunt", "grunt rodzimy", "Oceniamy, co jest pod spodem, zanim zdecydujemy o odwodnieniu i spadkach.", "var(--color-muted)"],
];

export default function Home() {
  return (
    <>
      {/* HERO: Workbench lite header — one statement, one action, specimens as the object */}
      <section>
        <div className="grid grid-cols-6 md:grid-cols-12">
          <div className="col-span-6 pad py-[clamp(3rem,8vw,7rem)] md:col-span-8">
            <h1 className="display">układamy kostkę brukową<span className="period" aria-hidden /></h1>
            <p className="prose-m mt-8 text-[var(--text-lg)] leading-snug">
              Podjazdy, tarasy, ścieżki i place wokół domu. Przyjeżdżamy, oglądamy teren i mówimy wprost, co się opłaca. [miasto i okolice]
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="tel:+48000000000" className="btn btn-signal">zadzwoń&nbsp;[telefon]</a>
              <a href="#wizualizator" className="btn btn-line">przymierz kostkę na swoim zdjęciu&nbsp;↓</a>
            </div>
          </div>
          <div className="col-span-6 border-[var(--color-ink)] md:col-span-4 md:border-l">
            <Specimens />
          </div>
        </div>
      </section>

      {/* WORKBENCH: the live visualizer is the product frame */}
      <section id="wizualizator" className="band">
        <div className="grid grid-cols-6 gap-y-6 pad md:grid-cols-12">
          <h2 className="h2 col-span-6 md:col-span-7">przymierz kostkę na swoim podjeździe.</h2>
          <p className="prose-m col-span-6 md:col-span-4 md:col-start-9">Wgraj zdjęcie, zaznacz cztery rogi nawierzchni i wybierz kostkę. Zdjęcie zostaje w Twojej przeglądarce. Nigdzie go nie wysyłamy.</p>
        </div>
        <div className="mt-10 border-y border-[var(--color-ink)] pad py-6"><VisualizerLoader /></div>
      </section>

      {/* INDEX: numbered full-width rows */}
      <section id="uslugi" className="band">
        <h2 className="h2 pad">co układamy.</h2>
        <div className="mt-10">
          {WORK.map(([t, d, id], i) => (
            <Link key={id} href={`/uslugi#${id}`} className={`irow ${i === WORK.length - 1 ? "irow-last" : ""}`}>
              <span className="grid grid-cols-6 items-baseline gap-y-2 pad py-6 md:grid-cols-12">
                <span className="h3 tnum col-span-6 text-[var(--color-muted)] md:col-span-1">0{i + 1}</span>
                <span className="h2 slide col-span-6 md:col-span-5">{t}</span>
                <span className="col-span-5 md:col-span-5">{d}</span>
                <span className="col-span-1 text-right text-[var(--text-xl)]" aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* THE PLATE: the page's one loud move */}
      <section className="plate" aria-label="Zadzwoń">
        <div className="plate-in">
          <div className="rails" aria-hidden />
          <div className="grid grid-cols-6 pad py-[clamp(4rem,9vw,8rem)] md:grid-cols-12">
            <p className="display col-span-6 md:col-span-12">zadzwoń. <span className="tnum">[telefon]</span></p>
            <p className="col-span-6 mt-8 text-[var(--text-lg)] leading-snug md:col-span-6">pn–pt [godziny] · [miasto i okolice]. Oglądamy teren i mówimy, ile to potrwa i od czego zależy cena.</p>
          </div>
        </div>
      </section>

      {/* CROSS-SECTION: a ruled matrix, four layers */}
      <section className="band">
        <div className="grid grid-cols-6 gap-y-6 pad md:grid-cols-12">
          <h2 className="h2 col-span-6 md:col-span-7">dobra kostka zaczyna się pod kostką.</h2>
          <p className="prose-m col-span-6 md:col-span-4 md:col-start-9">Zapadnięcia, kałuże i rozchodzące się spoiny biorą się najczęściej z podbudowy. Dlatego zaczynamy od niej, nie od wzoru.</p>
        </div>
        <div className="mt-10 border-y border-[var(--color-ink)]">
          {LAYERS.map(([tag, name, d, color], i) => (
            <div key={name} className={`grid grid-cols-6 md:grid-cols-12 ${i ? "border-t border-[var(--color-rule)]" : ""}`}>
              <div className="col-span-6 flex items-center px-6 py-5 md:col-span-3" style={{ background: color, color: i === 3 || i === 0 ? "var(--color-paper)" : "var(--color-ink)" }}>
                <span className="label" style={{ color: "inherit" }}>{tag}</span>
              </div>
              <h3 className="h3 col-span-6 pad py-5 md:col-span-3">{name}</h3>
              <p className="col-span-6 pad pb-5 md:col-span-6 md:py-5">{d}</p>
            </div>
          ))}
        </div>
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
            <h2 className="h2">poproś o oddzwonienie.</h2>
            <p className="prose-m mt-4">Zostaw numer. Oddzwonimy w godzinach pracy i umówimy oglądanie terenu.</p>
            <div className="mt-8 max-w-[32rem]"><ContactForm /></div>
          </div>
          <dl className="col-span-6 md:col-span-4 md:col-start-9">
            {[["telefon", "[telefon]"], ["e-mail", "[adres e-mail]"], ["adres", "[adres firmy]"], ["godziny", "pn–pt [godziny]"], ["działamy", "[miasto i okolice, promień w km]"]].map(([k, v], i, a) => (
              <div key={k} className={`border-t border-[var(--color-rule)] py-4 ${i === a.length - 1 ? "border-b border-[var(--color-ink)]" : ""}`}>
                <dt className="label">{k}</dt>
                <dd className="tnum mt-1 text-[var(--text-lg)] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
