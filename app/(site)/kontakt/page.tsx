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
    </section>
  );
}
