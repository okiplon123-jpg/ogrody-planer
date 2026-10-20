export const metadata = { title: "O nas: kostka brukowa i ogrody — NAZWA MARKI Białystok", description: "Kim jesteśmy, gdzie pracujemy i czym zajmujemy się przy kostce i ogrodach. [do uzupełnienia przez firmę]" };

export default function Page() {
  return (
    <section className="pad py-[clamp(3rem,8vw,7rem)]">
      <h1 className="h2">o nas.</h1>
      <div className="mt-10 grid grid-cols-6 gap-y-10 md:grid-cols-12">
        <article className="col-span-6 space-y-6 text-[var(--text-lg)] leading-relaxed md:col-span-7">
          <p>[Tu kilka prawdziwych zdań o firmie: od kiedy układacie kostkę, skąd jesteście, ile prac macie za sobą. Własnymi słowami, tak jak mówicie klientowi przez telefon.]</p>
          <p>[Kto przyjeżdża na pomiar, kto układa kostkę, kto zakłada ogrody, czym pracujecie.]</p>
          <p>[Jedna konkretna praca: jaki był teren, co sprawiło trudność, jak to rozwiązaliście.]</p>
        </article>
        <dl className="col-span-6 md:col-span-4 md:col-start-9">
          {[["działamy", "Białystok i okolice"], ["sprzęt", "[lista maszyn]"], ["godziny", "pn–pt 7:00–18:00"], ["telefon", "+48 885 879 108"]].map(([k, v], i, a) => (
            <div key={k} className={`border-t border-[var(--color-rule)] py-4 ${i === a.length - 1 ? "border-b border-[var(--color-ink)]" : ""}`}>
              <dt className="label">{k}</dt>
              <dd className="tnum mt-1 text-[var(--text-lg)] font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
