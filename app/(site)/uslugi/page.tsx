import Link from "next/link";
import { Photo } from "@/components/marketing/Art";
import { SERVICES } from "@/lib/content";
export const metadata = { title: "Usługi — NAZWA MARKI" };
export default function Page() {
  return (
    <div className="pt-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10"><p className="eyebrow mb-3 text-forest">Usługi</p><h1 className="max-w-3xl font-serif text-6xl leading-none md:text-8xl">Wszystko, czego potrzebuje Twoja posesja</h1></div>
      <div className="mx-auto mt-20 max-w-[1400px] space-y-24 px-5 pb-28 md:px-10">
        {SERVICES.map((s, i) => (
          <section key={s.id} id={s.id} className={`grid items-center gap-10 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div className="aspect-[4/3] overflow-hidden"><Photo kind={s.art} /></div>
            <div><span className="font-serif text-5xl text-forest/30">0{i + 1}</span><h2 className="mt-2 font-serif text-4xl md:text-5xl">{s.title}</h2><p className="mt-4 max-w-lg text-lg leading-relaxed text-charcoal/70">{s.long}</p>
              <Link href="/planer" className="btn btn-line mt-6">Zaplanuj w planerze</Link></div>
          </section>
        ))}
      </div>
    </div>
  );
}
