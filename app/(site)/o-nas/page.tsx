import Link from "next/link";
import { Photo } from "@/components/marketing/Art";
export const metadata = { title: "O nas — NAZWA MARKI" };
export default function Page() {
  return (
    <div className="pt-36">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 pb-28 md:grid-cols-2 md:px-10">
        <div><h1 className="font-serif text-6xl leading-none md:text-8xl">Przestrzeń wokół domu to część architektury</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-charcoal/70">[Miejsce na historię firmy.] Łączymy prace ziemne, nawierzchnie, ogród i oświetlenie w jeden spójny proces — z jednym zespołem odpowiedzialnym za całość. Tekst zastąpimy opisem prawdziwej firmy.</p>
          <ul className="mt-8 space-y-2 font-serif text-2xl">{["Kompleksowa obsługa posesji", "Przemyślany dobór materiałów", "Dbałość o detale", "Indywidualne podejście"].map((t) => <li key={t}>— {t}</li>)}</ul>
          <Link href="/kontakt" className="btn btn-dark mt-8">Skontaktuj się z nami</Link></div>
        <div className="aspect-[4/5] overflow-hidden"><Photo kind="garden" /></div>
      </div>
    </div>
  );
}
