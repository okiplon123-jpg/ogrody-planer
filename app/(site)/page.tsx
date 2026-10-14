import Link from "next/link";
import { Hero } from "@/components/marketing/Hero";
import { Reveal } from "@/components/marketing/Reveal";
import { PlannerShowcase } from "@/components/marketing/PlannerShowcase";
import { BeforeAfter } from "@/components/marketing/BeforeAfter";
import { Portfolio } from "@/components/marketing/Portfolio";
import { Photo } from "@/components/marketing/Art";
import { SERVICES } from "@/lib/content";

const STEPS = [["01", "Poznajemy Twoje potrzeby", "Rozmawiamy o tym, jak korzystasz z domu i ogrodu."], ["02", "Projektujemy przestrzeń", "Układamy nawierzchnie, zieleń i światło w spójną całość."], ["03", "Ustalamy zakres", "Doprecyzowujemy materiały i etapy prac."], ["04", "Realizujemy Twój projekt", "Jeden zespół prowadzi prace od przygotowania terenu do końca."]];
const WHY = ["Kompleksowa obsługa posesji", "Przemyślany dobór materiałów", "Dbałość o detale", "Indywidualne podejście", "Jeden zespół odpowiedzialny za realizację"];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="bg-forest py-24 text-white md:py-32">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal className="grid items-end gap-8 md:grid-cols-2">
            <div>
              <p className="eyebrow mb-4 text-sage">Interaktywny planer</p>
              <h2 className="font-serif text-5xl leading-[1.02] md:text-7xl">Zobacz swój ogród, <em className="text-sage">zanim powstanie.</em></h2>
            </div>
            <p className="max-w-lg text-lg leading-relaxed text-white/75">Stwórz własny projekt posesji. Dobierz kostkę, zaplanuj podjazd, dodaj trawnik i roślinność, a następnie zobacz efekt w trójwymiarze.</p>
          </Reveal>
          <Reveal className="mt-14"><PlannerShowcase /></Reveal>
          <Reveal className="mt-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <ul className="grid gap-6 sm:grid-cols-3">
              {["Projektujesz samodzielnie.", "Widzisz efekt w 3D.", "Zapisujesz projekt i pobierasz wizualizację."].map((t, i) => <li key={t} className="border-t border-sage/60 pt-4"><span className="font-serif text-2xl text-sage">0{i + 1}</span><p className="mt-2 text-white/85">{t}</p></li>)}
            </ul>
            <Link href="/planer" className="btn btn-sage">Otwórz planer ogrodu</Link>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div><p className="eyebrow mb-3 text-forest">Usługi</p><h2 className="font-serif text-5xl md:text-6xl">Od nawierzchni po ostatnią roślinę</h2></div>
          <Link href="/uslugi" className="btn btn-line">Wszystkie usługi</Link>
        </Reveal>
        <div className="grid gap-x-6 gap-y-14 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 120}>
              <Link href="/uslugi" className="group block">
                <div className={`overflow-hidden ${i % 2 ? "aspect-[4/5]" : "aspect-[4/4.6]"}`}><div className="h-full w-full transition duration-[1400ms] group-hover:scale-105"><Photo kind={s.art} /></div></div>
                <h3 className="mt-5 font-serif text-3xl">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-charcoal/70">{s.text}</p>
                <span className="mt-3 inline-block border-b border-forest pb-0.5 text-[12px] uppercase tracking-[.16em] text-forest transition group-hover:pl-2">Dowiedz się więcej →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-sand py-24 md:py-32">
        <div className="mx-auto max-w-[1200px] px-5 md:px-10">
          <Reveal className="mb-10 text-center"><p className="eyebrow mb-3 text-forest">Przed i po</p><h2 className="font-serif text-5xl md:text-6xl">Przemiana, którą widać</h2><p className="mt-3 text-sm text-charcoal/60">Ilustracja demonstracyjna — przesuń suwak.</p></Reveal>
          <Reveal><BeforeAfter /></Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow mb-3 text-forest">Wybrane realizacje</p><h2 className="font-serif text-5xl md:text-6xl">Projekty demonstracyjne</h2></div></Reveal>
        <Portfolio />
      </section>

      <section className="bg-ivory pb-24 md:pb-32">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal className="mb-12"><p className="eyebrow mb-3 text-forest">Jak to działa</p><h2 className="font-serif text-5xl md:text-6xl">Cztery kroki do gotowej przestrzeni</h2></Reveal>
          <div className="grid gap-px bg-charcoal/15 md:grid-cols-4">
            {STEPS.map(([n, t, d], i) => <Reveal key={n} delay={i * 100} className="bg-ivory p-8"><span className="font-serif text-6xl text-forest/30">{n}</span><h3 className="mt-6 font-serif text-2xl">{t}</h3><p className="mt-2 text-sm leading-relaxed text-charcoal/65">{d}</p></Reveal>)}
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-24 text-white md:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-[1fr_1.4fr] md:px-10">
          <Reveal><p className="eyebrow mb-3 text-sage">Dlaczego my</p><h2 className="font-serif text-5xl leading-tight md:text-6xl">Detale decydują o całości</h2></Reveal>
          <ul>{WHY.map((w, i) => <Reveal key={w} delay={i * 80}><li className="flex items-baseline gap-5 border-b border-white/15 py-5"><span className="font-serif text-sage">0{i + 1}</span><span className="font-serif text-2xl md:text-3xl">{w}</span></li></Reveal>)}</ul>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-32 text-white md:py-44">
        <div className="absolute inset-0 -z-10"><Photo kind="house" /></div><div className="absolute inset-0 -z-10 bg-charcoal/55" />
        <Reveal className="mx-auto max-w-[1000px] px-5 text-center">
          <h2 className="font-serif text-5xl leading-[1.02] md:text-8xl">Zacznij od pomysłu. <em className="text-sage">Resztę zaprojektujemy razem.</em></h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4"><Link href="/planer" className="btn btn-sage">Zaprojektuj swoją posesję</Link><Link href="/kontakt" className="btn btn-ghost">Skontaktuj się z nami</Link></div>
        </Reveal>
      </section>
    </>
  );
}
