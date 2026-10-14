import Link from "next/link";
import { PhotoSlot } from "@/components/marketing/PhotoSlot";
import { Swatches } from "@/components/marketing/Swatches";
import { Faq } from "@/components/marketing/Faq";
import { ContactForm } from "@/components/marketing/ContactForm";
import { VisualizerLoader } from "@/components/visualizer/VisualizerLoader";
import { Reveal } from "@/components/marketing/Reveal";

const WORK: string[][] = [
  ["Podjazdy i wjazdy", "Szerokość pod samochody, spadek od domu, krawędź, która się nie rozjeżdża.", "podjazd z kostki, widok od ulicy", "/zdjecia/trawnik-przed-domem.jpg", "stock"],
  ["Tarasy", "Płyty lub kostka przy domu, na stabilnej podbudowie, z odpływem wody.", "taras przy domu", "/zdjecia/taras-drewno-1.jpg", "stock"],
  ["Ścieżki i chodniki", "Od furtki do drzwi i dookoła domu — antypoślizgowo i równo.", "ścieżka z kostki między trawnikiem a domem", "/zdjecia/dom-ogrod-rosliny.jpg", "stock"],
  ["Place i miejsca postojowe", "Większe powierzchnie pod obciążenie: parkingi, place gospodarcze.", "plac z kostki przy budynku gospodarczym", "/zdjecia/plac-przy-kosciele.jpg", ""],
  ["Obrzeża, schody, opaski", "Wykończenia, które decydują o tym, jak nawierzchnia się trzyma i wygląda.", "detal obrzeża i schodków", "/zdjecia/sciezka-kamien.jpg", "stock"],
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
          <div className="relative min-h-[360px] border-ink md:col-span-5 md:border-l-[1.5px]">
            <PhotoSlot src="/zdjecia/plac-przy-kosciele.jpg" alt="Plac z płyt i kostki w trakcie zagęszczania, zagęszczarka na świeżo ułożonej nawierzchni" brief="" className="absolute inset-0 border-0 object-[50%_62%]" />
            <div className="absolute left-4 right-4 top-12 flex items-center gap-3"><span className="eyebrow bg-paper px-2 py-1">plac z płyt i kostki</span><span className="dim-line h-4 flex-1" /><span className="eyebrow bg-paper px-2 py-1">[m²] · [miejscowość]</span></div>
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
          {WORK.map(([t, d, ph, src, st], i) => (
            <Reveal key={t}>
              <div className={`grid items-stretch gap-0 border-b-[1.5px] border-ink md:grid-cols-[1fr_1.1fr_240px] ${i % 2 ? "md:bg-concrete/30" : ""}`}>
                <h3 className="px-0 py-6 font-serif text-3xl md:px-6 md:text-4xl">{t}</h3>
                <p className="max-w-lg self-center pb-4 text-lg text-ink/75 md:px-6 md:pb-0">{d}</p>
                <div className="h-36 md:h-auto md:min-h-[120px] md:border-l-[1.5px] md:border-ink"><PhotoSlot brief={ph} src={src || undefined} stock={st === "stock"} alt={t} className="border-0" /></div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-[1fr_1fr_1.1fr] md:items-end">
          <div className="h-[260px]"><PhotoSlot src="/zdjecia/dom-patio-trawnik.jpg" stock alt="Dom z tarasem i trawnikiem" brief="trawnik i taras" /></div>
          <div className="h-[260px]"><PhotoSlot src="/zdjecia/dom-ogrod-rosliny.jpg" stock alt="Ogród ze ścieżką z kamienia" brief="ogród i ścieżka" className="object-[50%_70%]" /></div>
          <p className="text-lg leading-relaxed text-ink/75">Przy okazji kostki zajmiemy się też tym, co jest wokół niej: trawnikiem, rabatami i ogrodzeniem. Ale kostka to to, w czym jesteśmy najlepsi. [do potwierdzenia przez firmę]</p>
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
        <p className="mt-3 text-sm text-ink/60">Wzory poglądowe. Dokładne kolory i producentów pokażemy na próbkach. [do uzupełnienia]</p>
      </section>

      <section className="border-y-[1.5px] border-ink bg-concrete/40">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-8 md:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><h2 className="font-serif text-5xl leading-none md:text-7xl">Z ostatnich realizacji.</h2><Link href="/realizacje" className="btn btn-line">Wszystkie →</Link></div>
          <div className="space-y-12">
            {[["Plac z płyt i kostki z wyodrębnioną ścieżką", "right"], ["Taras przy domu, płyty wielkoformatowe", "left"], ["Ścieżka i opaska wokół domu", "right"]].map(([t, side], i) => (
              <article key={t} className={`grid gap-6 md:grid-cols-12 md:items-end ${side === "left" ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className={`h-[300px] md:h-[420px] ${i === 1 ? "md:col-span-5" : "md:col-span-7"}`}><PhotoSlot brief={`${t} — ujęcie całości`} src={i === 0 ? "/zdjecia/plac-przy-kosciele.jpg" : undefined} alt={t} /></div>
                <div className={i === 1 ? "md:col-span-7" : "md:col-span-5"}>
                  <h3 className="font-serif text-4xl leading-tight md:text-5xl">{t}</h3>
                  <dl className="eyebrow mt-4 grid grid-cols-3 gap-3 border-t-[1.5px] border-ink pt-3"><div><dt className="text-ink/50">Powierzchnia</dt><dd>[m²]</dd></div><div><dt className="text-ink/50">Materiał</dt><dd>[kostka]</dd></div><div><dt className="text-ink/50">Czas</dt><dd>[dni]</dd></div></dl>
                  <p className="mt-4 text-ink/70">[Krótki opis: jaki był teren, co było trudne, jak to rozwiązaliśmy.]</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-12 px-5 py-16 md:grid-cols-[1.3fr_1fr] md:px-8 md:py-24">
        <div><h2 className="mb-8 font-serif text-5xl leading-none md:text-7xl">Pytania, które słyszymy.</h2><Faq /></div>
        <div className="border-[1.5px] border-ink bg-concrete/40 p-6 md:self-start"><ContactForm /><p className="eyebrow mt-5 text-ink/60">albo zadzwoń: [telefon] · pn–pt [godziny]</p></div>
      </section>
    </>
  );
}
