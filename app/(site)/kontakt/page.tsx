import { ContactForm } from "@/components/marketing/ContactForm";
export const metadata = { title: "Kontakt i oględziny terenu w Białymstoku | Gryczewski", description: "Zadzwoń 885 879 108 albo zostaw numer. Oglądamy teren i ustalamy zakres prac. Wycena po obejrzeniu, bez zobowiązań. pn–pt 7:00–18:00." };

export default function Page() {
  return (
    <section className="pad py-[clamp(3rem,8vw,7rem)]">
      <h1 className="display">zadzwoń<span className="period" aria-hidden /></h1>
      <p className="mt-6"><a href="tel:+48885879108" className="tnum text-[var(--text-2xl)] font-extrabold tracking-tight">+48 885 879 108</a></p>
      <div className="mt-16 grid grid-cols-6 gap-y-10 md:grid-cols-12">
        <dl className="col-span-6 md:col-span-5">
          {[["kontakt", "Patryk Gryczewski"], ["e-mail", "gryczewski.bud@gmail.com"], ["adres", "ul. Tysiąclecia P.P, 15-111 Białystok"], ["godziny", "pn–pt 7:00–18:00"], ["działamy", "Białystok i okolice"], ["NIP", "5423470508"]].map(([k, v], i, a) => (
            <div key={k} className={`border-t border-[var(--color-rule)] py-4 ${i === a.length - 1 ? "border-b border-[var(--color-ink)]" : ""}`}>
              <dt className="label">{k}</dt>
              <dd className="mt-1 text-[var(--text-lg)] font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="col-span-6 md:col-span-5 md:col-start-8">
          <h2 className="h3">wolisz, żebyśmy się odezwali?</h2>
          <div className="mt-6"><ContactForm /></div>
        </div>
      </div>

      <section className="mt-20 border-t border-[var(--color-ink)] pt-10">
        <h2 className="h3">jak wygląda kontakt z nami</h2>
        <ol className="prose-m mt-4 max-w-[44rem] space-y-3">
          <li><strong>Dzwonisz albo zostawiasz numer.</strong> Odbieramy w godzinach pracy, pn–pt 7:00–18:00. Jeśli nie odbierzemy, oddzwonimy.</li>
          <li><strong>Umawiamy oględziny terenu.</strong> Przyjeżdżamy do Ciebie w Białymstoku lub okolicach, sprawdzamy grunt, spadki i dojazd dla sprzętu.</li>
          <li><strong>Dostajesz wycenę po obejrzeniu terenu.</strong> Bez zobowiązań. Dopiero potem decydujesz, czy robimy prace.</li>
        </ol>
        <h2 className="h3 mt-10">w czym pomagamy</h2>
        <p className="prose-m mt-3 max-w-[44rem]">Układamy kostkę brukową (podjazdy, tarasy, ścieżki, place), zakładamy trawniki i ogrody oraz wykonujemy prace ziemne ciężkim sprzętem: korytowanie, podbudowę, równanie terenu i drobne rozbiórki. Możesz też zaplanować działkę w planerze albo przymierzyć kostkę na zdjęciu swojego domu w wizualizatorze.</p>
      </section>
    </section>
  );
}
