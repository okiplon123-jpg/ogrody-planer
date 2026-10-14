import Link from "next/link";
import { Swatches } from "@/components/marketing/Swatches";
import { Faq } from "@/components/marketing/Faq";
import { ContactForm } from "@/components/marketing/ContactForm";
import { VisualizerLoader } from "@/components/visualizer/VisualizerLoader";
import { Reveal } from "@/components/marketing/Reveal";

const WORK: string[][] = [
  ["Podjazdy i wjazdy", "Szerokość pod samochody, spadek od domu, krawędź, która się nie rozjeżdża.", "podjazd z kostki", "/zdjecia/kostka-jodelka-szara.jpg", "stock"],
  ["Tarasy", "Płyty lub kostka przy domu, na stabilnej podbudowie, z odpływem wody.", "taras przy domu", "/zdjecia/kostka-jodelka-brazowa.jpg", "stock"],
  ["Ścieżki i chodniki", "Od furtki do drzwi i dookoła domu — antypoślizgowo i równo.", "ścieżka z kostki", "/zdjecia/sciezka-cegla-ogrod.jpg", "stock"],
  ["Place i miejsca postojowe", "Większe powierzchnie pod obciążenie: parkingi, place gospodarcze.", "plac z kostki", "/zdjecia/kostka-geometryczna.jpg", "stock"],
  ["Obrzeża, schody, opaski", "Wykończenia, które decydują o tym, jak nawierzchnia się trzyma i wygląda.", "obrzeże i schody", "/zdjecia/schody-beton-cien.jpg", "stock"],
];
const LAYERS = [
  ["Kostka lub płyta", "Warstwa, którą widać. Wzór i kolor dobierasz do domu — możesz go przymierzyć w wizualizatorze.", "#6c6f70"],
  ["Podsypka", "Cienka warstwa piasku lub grysu, w której osadzamy kostkę i wyrównujemy powierzchnię.", "#d8c89c"],
  ["Podbudowa", "Kruszywo zagęszczane warstwami. To ona niesie ciężar i decyduje, czy nawierzchnia za 5 lat będzie równa. Grubość zależy od gruntu i obciążenia.", "#9a958a"],
  ["Grunt rodzimy", "Oceniamy, co jest pod spodem, i ustalamy odwodnienie oraz spadki, zanim cokolwiek położymy.", "#4a3f33"],
];

export default function Home() {
  return (
    <>
      <section className="border-b-[1.5px] border-ink">
        <div className="mx-auto grid max-w-[1500px] md:grid-cols-12">
          <div className="px-5 py-12 md:col-span-7 md:px-8 md:py-20">
            <p className="eyebrow text-rust">Kostka brukowa · [miasto i okolice]</p>
            <h1 className="mt-5 font-serif text-[clamp(3.4rem,8.4vw,9rem)] leading-[0.9]">Układamy kostkę brukową.</h1>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-ink/80">Podjazdy, tarasy, ścieżki i place wokół domu — od pomiaru i podbudowy po fugowanie. Przyjeżdżamy, oglądamy teren i mówimy wprost, co się opłaca.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="tel:+48000000000" className="btn btn-rust">Zadzwoń [telefon]</a>
              <Link href="/wizualizator" className="btn btn-line">Przymierz kostkę na swoim zdjęciu →</Link>
            </div>
          </div>
          <div className="grid min-h-[380px] grid-cols-2 border-ink md:col-span-5 md:border-l-[1.5px]">
            {[["kostka-jodelka-szara", "szara · jodełka"], ["kostka-geometryczna", "szara · kształt Z"], ["kostka-jodelka-brazowa", "brąz · jodełka"], ["kostka-czerwona", "ceglasta · jodełka"]].map(([f, n], i) => (
              <Link key={f} href="/wizualizator" className={`group relative block overflow-hidden border-ink ${i % 2 ? "border-l-[1.5px]" : ""} ${i > 1 ? "border-t-[1.5px]" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/zdjecia/${f}.jpg`} alt={`Kostka ${n}`} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="eyebrow absolute bottom-2 left-2 bg-paper px-2 py-1">{n}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-[1.5px] border-ink bg-concrete/40">
        <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8 md:py-20">
          <div className="mb-8 grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-end">
            <h2 className="font-serif text-5xl leading-none md:text-7xl">Zobacz kostkę na swoim podjeździe.</h2>
            <p className="max-w-md text-lg text-ink/75">Wgraj zdjęcie, zaznacz cztery rogi nawierzchni i przymierz kolory oraz wzory. Zdjęcie zostaje w Twojej przeglądarce.</p>
          </div>
          <VisualizerLoader />
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-8 md:py-24">
        <Reveal><h2 className="max-w-3xl font-serif text-5xl leading-none md:text-7xl">Co układamy.</h2></Reveal>
        <div className="mt-10 border-t-[1.5px] border-ink">
          {WORK.map(([t, d]) => (
            <Reveal key={t}>
              <Link href="/wizualizator" className="group grid items-center gap-2 border-b-[1.5px] border-ink py-6 transition hover:bg-concrete/40 md:grid-cols-[1fr_1.1fr_auto] md:gap-8 md:px-4">
                <h3 className="font-serif text-3xl md:text-5xl">{t}</h3>
                <p className="max-w-lg text-lg text-ink/75">{d}</p>
                <span className="eyebrow text-rust md:text-right">przymierz kostkę →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y-[1.5px] border-ink bg-ink text-paper">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-[1fr_1.3fr] md:px-8 md:py-24">
          <div className="md:sticky md:top-24 md:self-start">
            <p className="eyebrow text-rust">Przekrój B-B</p>
            <h2 className="mt-3 font-serif text-5xl leading-none md:text-7xl">Dobra kostka zaczyna się pod kostką.</h2>
            <p className="mt-6 max-w-md text-lg text-paper/75">Wiele problemów — zapadnięcia, kałuże, rozchodzące się spoiny — bierze się z podbudowy. Dlatego od niej zaczynamy.</p>
          </div>
          <div className="border-[1.5px] border-paper/80">
            {LAYERS.map(([t, d, c], i) => (
              <div key={t} className={`grid grid-cols-[18px_1fr] ${i ? "border-t-[1.5px] border-paper/80" : ""}`}>
                <div style={{ background: c }} />
                <div className="p-5 md:p-7"><h3 className="font-serif text-3xl">{t}</h3><p className="mt-2 text-paper/75">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><h2 className="font-serif text-5xl leading-none md:text-7xl">Kostki, które układamy.</h2><Link href="/wizualizator" className="btn btn-line">Przymierz na zdjęciu →</Link></div>
        <Swatches />
        <p className="mt-3 text-sm text-ink/60">Zdjęcia poglądowe wzorów. Dokładne kolory i producentów pokażemy na próbkach. [do uzupełnienia]</p>
      </section>

            <section className="mx-auto grid max-w-[1500px] gap-12 px-5 py-16 md:grid-cols-[1.3fr_1fr] md:px-8 md:py-24">
        <div><h2 className="mb-8 font-serif text-5xl leading-none md:text-7xl">Pytania, które słyszymy.</h2><Faq /></div>
        <div className="border-[1.5px] border-ink bg-concrete/40 p-6 md:self-start"><ContactForm /><p className="eyebrow mt-5 text-ink/60">albo zadzwoń: [telefon] · pn–pt [godziny]</p></div>
      </section>
    </>
  );
}
