import Link from "next/link";
import { PhotoSlot } from "@/components/marketing/PhotoSlot";
export const metadata = { title: "Co układamy: podjazdy, tarasy, ścieżki z kostki — NAZWA MARKI [miasto]" };

const ITEMS: (string | string[])[][] = [
  ["Podjazdy i wjazdy", "Najczęstsza praca. Dobieramy szerokość pod auta, spadek odprowadzający wodę od domu i wzór, który nie męczy oka.", ["pomiar i wytyczenie", "wykop i podbudowa", "obrzeża", "kostka i fugowanie"], "podjazd z kostki — całość i detal krawędzi"],
  ["Tarasy", "Płyta lub kostka przy domu. Najważniejszy jest spadek od ściany i odpływ wody, zanim pomyślimy o wzorze.", ["spadki i odwodnienie", "podbudowa", "płyty lub kostka"], "taras przy domu, widok z ogrodu"],
  ["Ścieżki i chodniki", "Od furtki do drzwi i dookoła domu. Równe, antypoślizgowe, z obrzeżem, które trzyma kształt.", ["wytyczenie", "podbudowa", "kostka", "obrzeża"], "ścieżka z kostki wzdłuż trawnika"],
  ["Place i parkingi", "Większe obciążenia wymagają grubszej podbudowy i innego doboru kostki. Liczymy to dla konkretnego gruntu.", ["badanie gruntu", "gruba podbudowa", "kostka na obciążenie"], "plac przy budynku", "/zdjecia/plac-przy-kosciele.jpg", ""],
  ["Obrzeża, schody, opaski", "Elementy, których nie widać z daleko, a które decydują, jak nawierzchnia trzyma się latami.", ["obrzeża betonowe", "schody", "opaska wokół domu"], "schody z kostki, detal"],
];
export default function Page() {
  return (
    <div>
      <section className="border-b-[1.5px] border-ink px-5 py-14 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1500px]"><p className="eyebrow text-rust">Zakres prac</p><h1 className="mt-3 max-w-4xl font-serif text-[clamp(3rem,7vw,7rem)] leading-[0.92]">Co układamy i jak to robimy.</h1></div>
      </section>
      {ITEMS.map(([t, d, steps, ph, src, st], i) => (
        <section key={t as string} className={`border-b-[1.5px] border-ink ${i % 2 ? "bg-concrete/40" : ""}`}>
          <div className={`mx-auto grid max-w-[1500px] md:grid-cols-12 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div className="min-h-[300px] md:col-span-5"><PhotoSlot brief={ph as string} src={(src as string) || undefined} stock={st === "stock"} alt={t as string} className="border-0" /></div>
            <div className="px-5 py-10 md:col-span-7 md:px-12 md:py-14">
              <h2 className="font-serif text-5xl leading-none md:text-6xl">{t as string}</h2>
              <p className="mt-5 max-w-xl text-xl leading-relaxed text-ink/75">{d as string}</p>
              <ol className="eyebrow mt-8 flex flex-wrap gap-x-2 gap-y-2">{(steps as string[]).map((s, k) => <li key={s} className="flex items-center gap-2"><span className="border-[1.5px] border-ink px-2 py-1">{s}</span>{k < (steps as string[]).length - 1 && <span className="text-rust">→</span>}</li>)}</ol>
            </div>
          </div>
        </section>
      ))}
      <section className="px-5 py-16 md:px-8"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-6"><p className="max-w-xl font-serif text-4xl leading-tight">Nie wiesz, co wybrać? Przymierz kostkę na zdjęciu swojego domu.</p><Link href="/wizualizator" className="btn btn-rust">Przymierz kostkę →</Link></div></section>
    </div>
  );
}
