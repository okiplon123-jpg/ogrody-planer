import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SERVICES, bySlug } from "@/lib/services";
import { SITE_URL, WHATSAPP_URL } from "@/lib/site";
import { Faq } from "@/components/marketing/Faq";
import { ContactForm } from "@/components/marketing/ContactForm";

export const dynamicParams = false;
export function generateStaticParams() { return SERVICES.map((s) => ({ usluga: s.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ usluga: string }> }): Promise<Metadata> {
  const s = bySlug((await params).usluga);
  if (!s) return {};
  return { title: s.title, description: s.description, alternates: { canonical: `/${s.slug}` }, openGraph: { title: s.title, description: s.description, url: `/${s.slug}`, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: s.h1 }] }, twitter: { card: "summary_large_image", images: ["/og-image.png"] } };
}

const STEPS: [string, string, string][] = [
  ["1", "dzwonisz albo zostawiasz numer", "Oddzwonimy w godzinach pracy (pn–pt 7:00–18:00)."],
  ["2", "oglądamy teren", "Przyjeżdżamy, sprawdzamy grunt, spadki i dojazd. Wycena po obejrzeniu, bez zobowiązań."],
  ["3", "przygotowujemy teren i wykonujemy", "Teren przygotowujemy sami. Odbiór robimy razem z Tobą."],
];

export default async function ServicePage({ params }: { params: Promise<{ usluga: string }> }) {
  const s = bySlug((await params).usluga);
  if (!s) notFound();
  const others = SERVICES.filter((x) => x.slug !== s.slug);
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: s.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  const crumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: s.short, item: `${SITE_URL}/${s.slug}` },
    ],
  };
  const serviceLd = {
    "@context": "https://schema.org", "@type": "Service", name: s.h1, serviceType: s.short,
    provider: { "@id": `${SITE_URL}/#firma` }, areaServed: { "@type": "City", name: "Białystok" }, url: `${SITE_URL}/${s.slug}`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([faqLd, serviceLd, crumbLd]) }} />

      <section>
        <div className="grid grid-cols-6 md:grid-cols-12">
          <div className="col-span-6 pad pb-[clamp(2.5rem,5vw,4.5rem)] pt-[clamp(2rem,3.5vw,3rem)] md:col-span-8">
            <h1 className="display-m" style={{ fontSize: "clamp(2.25rem, 4.6vw, 4.2rem)" }}>{s.h1}<span className="period" aria-hidden /></h1>
            <p className="prose-m mt-6 max-w-[40rem] text-[var(--text-lg)] leading-snug">{s.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="tel:+48885879108" className="btn btn-signal">zadzwoń&nbsp;885&nbsp;879&nbsp;108</a>
              <a href="#formularz" className="btn btn-dark">umów oględziny</a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn btn-line">napisz na WhatsApp</a>
            </div>
            <p className="label mt-5">pn–pt 7:00–18:00 · Białystok i okolice</p>
          </div>
          <div className="col-span-6 border-t border-[var(--color-ink)] bg-[var(--color-paper-2)] px-6 py-6 md:col-span-4 md:border-l md:border-t-0">
            <p className="label">umów oględziny</p>
            <p className="h3 mt-2">zostaw numer, oddzwonimy.</p>
            <div className="mt-3"><ContactForm service={s.short} compact withArea idp="hero" /></div>
          </div>
        </div>
      </section>

      <section className="band">
        <h2 className="h2 pad">jak to wygląda.</h2>
        <ol className="mt-10 grid border-y border-[var(--color-ink)] md:grid-cols-3">
          {STEPS.map(([n, t, d], i) => (
            <li key={n} className={`px-6 py-8 ${i ? "border-t border-[var(--color-ink)] md:border-l md:border-t-0" : ""}`}>
              <p className="label">{n}</p>
              <h3 className="h3 mt-2">{t}</h3>
              <p className="prose-m mt-3">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="band">
        <div className="grid grid-cols-6 gap-y-8 pad md:grid-cols-12">
          <h2 className="h2 col-span-6 md:col-span-5">co obejmuje.</h2>
          <div className="col-span-6 md:col-span-7">
            <ul>
              {s.includes.map((x, i) => (
                <li key={x} className="grid grid-cols-[2.5rem_1fr] items-baseline gap-2 border-t border-[var(--color-rule)] py-4 last:border-b">
                  <span className="label">{String(i + 1).padStart(2, "0")}</span>
                  <span className="prose-m">{x}</span>
                </li>
              ))}
            </ul>
            {s.time && <p className="prose-m mt-6"><strong>Czas:</strong> {s.time}</p>}
            <p className="prose-m mt-3"><strong>Cena:</strong> {s.priceFactors}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#formularz" className="btn btn-dark">zapytaj o wycenę</a>
              <a href="tel:+48885879108" className="btn btn-line">zadzwoń</a>
            </div>
          </div>
        </div>
      </section>

      {s.tools.length > 0 && (
      <section className="band">
        <div className="grid grid-cols-6 gap-y-6 pad md:grid-cols-12">
          <h2 className="h2 col-span-6 md:col-span-7">zobacz, zanim zadzwonisz.</h2>
        </div>
        <div className="mt-10 grid border-y border-[var(--color-ink)] md:grid-cols-2">
          {s.tools.includes("wizualizator") && (
            <Link href="/wizualizator" className="irow block px-6 py-8">
              <p className="label">wizualizator</p>
              <h3 className="h3 mt-2 slide">przymierz kostkę na zdjęciu swojego domu →</h3>
              <p className="prose-m mt-3">Wgraj zdjęcie, zaznacz cztery rogi i wybierz kostkę. Zdjęcie zostaje w Twojej przeglądarce.</p>
            </Link>
          )}
          {s.tools.includes("planer") && (
            <Link href="/planer" className={`irow block px-6 py-8 ${s.tools.length > 1 ? "border-t border-[var(--color-ink)] md:border-l md:border-t-0" : ""}`}>
              <p className="label">planer</p>
              <h3 className="h3 mt-2 slide">zaprojektuj działkę w 2D i 3D →</h3>
              <p className="prose-m mt-3">Narysuj podjazd, trawnik i rabaty. Planer policzy, ile kostki i trawnika potrzeba. Gotowy projekt możesz od razu wysłać do nas.</p>
            </Link>
          )}
        </div>
      </section>
      )}

      <section className="band">
        <div className="grid grid-cols-6 gap-y-8 pad md:grid-cols-12">
          <h2 className="h2 col-span-6 md:col-span-5">pytania.</h2>
          <div className="col-span-6 md:col-span-6 md:col-start-7"><Faq items={s.faq} /></div>
        </div>
      </section>

      <section id="formularz" className="band scroll-mt-20">
        <div className="grid grid-cols-6 gap-y-8 pad md:grid-cols-12">
          <div className="col-span-6 md:col-span-6">
            <h2 className="h2">umów oględziny.</h2>
            <p className="prose-m mt-4">Zostaw numer, a oddzwonimy w godzinach pracy. Wycena po obejrzeniu terenu, bez zobowiązań.</p>
            <div className="mt-8 max-w-[32rem]"><ContactForm service={s.short} withArea idp="bot" /></div>
          </div>
          <div className="col-span-6 md:col-span-4 md:col-start-9">
            <p className="label">wolisz zadzwonić?</p>
            <a href="tel:+48885879108" className="tnum mt-2 block text-[var(--text-2xl)] font-extrabold tracking-tight">885&nbsp;879&nbsp;108</a>
            <p className="prose-m mt-2">pn–pt 7:00–18:00</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn btn-line mt-4">napisz na WhatsApp</a>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-ink)] pad py-10">
        <p className="label">inne usługi</p>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {others.map((o) => <li key={o.slug}><Link href={`/${o.slug}`} className="underline underline-offset-4">{o.short}</Link></li>)}
        </ul>
      </section>
    </>
  );
}
