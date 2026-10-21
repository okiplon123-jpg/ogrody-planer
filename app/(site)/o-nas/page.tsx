export const metadata = { title: "O firmie: kostka i ogrody w Białymstoku | Gryczewski", description: "Roboty budowlano-drogowe Patryk Gryczewski: kostka brukowa, ogrody i prace ziemne w Białymstoku. Własny sprzęt, ponad 200 realizacji." };

export default function Page() {
  return (
    <section className="pad py-[clamp(3rem,8vw,7rem)]">
      <h1 className="h2">o nas.</h1>
      <div className="mt-10 grid grid-cols-6 gap-y-10 md:grid-cols-12">
        <article className="col-span-6 space-y-6 text-[var(--text-lg)] leading-relaxed md:col-span-7">
          <h2 className="h3">kim jesteśmy</h2>
          <p>Jesteśmy firmą z Białegostoku i działamy w całych okolicach. Układamy kostkę brukową i zakładamy ogrody. Na jednej posesji często jedno łączy się z drugim: podjazd z trawnikiem, taras z rabatami, ścieżka z oświetleniem. Dzięki temu rozmawiasz z jedną ekipą, a nie z trzema. Mamy za sobą ponad 200 realizacji: podjazdów, ogrodów, tarasów i ścieżek.</p>
          <h2 className="h3 pt-4">kto robi i czym</h2>
          <p>Na pomiar przyjeżdża Patryk Gryczewski. Potem ta sama ekipa robi wykop, podbudowę, układa kostkę i sadzi rośliny. Mamy własny sprzęt: koparkę kołową 8 t, miniładowarkę 4 t, walec 2 t i zagęszczarki w każdym rozmiarze. Dlatego teren przygotowujemy sami.</p>
          <h2 className="h3 pt-4">jak zaczynamy</h2>
          <p>Zwykle zaczyna się tak: oglądamy podwórko, mierzymy, patrzymy, którędy spływa woda i którędy wjeżdża auto. Potem mówimy wprost, co warto zrobić, a co można odpuścić. Typowy podjazd zajmuje około dwóch tygodni. Jeśli po pracach coś jest nie tak, wracamy i poprawiamy.</p>
        </article>
        <dl className="col-span-6 md:col-span-4 md:col-start-9">
          {[["działamy", "Białystok i okolice"], ["sprzęt", "Koparka kołowa 8 t\nMiniładowarka 4 t\nZagęszczarki w każdym rozmiarze\nWalec 2 t"], ["godziny", "pn–pt 7:00–18:00"], ["telefon", "+48 885 879 108"]].map(([k, v], i, a) => (
            <div key={k} className={`border-t border-[var(--color-rule)] py-4 ${i === a.length - 1 ? "border-b border-[var(--color-ink)]" : ""}`}>
              <dt className="label">{k}</dt>
              <dd className="tnum mt-1 whitespace-pre-line text-[var(--text-lg)] font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
