import { PhotoSlot } from "@/components/marketing/PhotoSlot";
export const metadata = { title: "Realizacje: podjazdy i tarasy z kostki — NAZWA MARKI [miasto]" };
const W = ["Plac z płyt i kostki, ścieżka z ciemnej kostki", "Taras, płyty wielkoformatowe", "Ścieżka i opaska wokół domu", "Plac przy budynku gospodarczym", "Podjazd z obrzeżem z jasnej kostki", "Schody z kostki przy wejściu"];
export default function Page() {
  return (
    <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8 md:py-24">
      <p className="eyebrow text-rust">Realizacje · plansza R-01</p>
      <h1 className="mt-3 max-w-4xl font-serif text-[clamp(3rem,7vw,7rem)] leading-[0.92]">Tak wyglądają nasze nawierzchnie.</h1>
      <p className="mt-6 max-w-xl text-lg text-ink/70">Poniżej miejsca na prawdziwe realizacje: zdjęcie przed, zdjęcie po, metraż i materiał. [do uzupełnienia zdjęciami firmy]</p>
      <div className="mt-12 columns-1 gap-5 md:columns-2 lg:columns-3">
        {W.map((t, i) => (
          <article key={t} className="mb-5 break-inside-avoid border-[1.5px] border-ink">
            <div className={i % 3 === 0 ? "h-[420px]" : i % 3 === 1 ? "h-[300px]" : "h-[360px]"}><PhotoSlot brief={`${t}`} src={i === 0 ? "/zdjecia/plac-przy-kosciele.jpg" : undefined} alt={t} className="border-0" /></div>
            <div className="p-4"><h2 className="font-serif text-2xl">{t}</h2><p className="eyebrow mt-2 text-ink/60">[m²] · [materiał] · [miejscowość]</p></div>
          </article>
        ))}
      </div>
    </div>
  );
}
