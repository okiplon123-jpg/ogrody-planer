export const metadata = { title: "O nas — ekipa od kostki brukowej NAZWA MARKI [miasto]" };
export default function Page() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-14 md:px-8 md:py-24">
      <p className="eyebrow text-rust">O nas</p>
      <h1 className="mt-3 font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.92]">Układamy kostkę od początku do końca.</h1>
      <div className="mt-12 max-w-3xl space-y-6 text-xl leading-relaxed text-ink/80">
        <p>[Tu kilka prawdziwych zdań o firmie: od kiedy układacie kostkę, skąd jesteście, ile prac za Wami. Własnymi słowami, tak jak mówicie klientowi przez telefon.]</p>
        <p>[Kto przyjeżdża na pomiar, kto układa, czym pracujecie.]</p>
        <p className="eyebrow border-t-[1.5px] border-ink pt-4 text-ink/60">Działamy: [miasto i okolice, promień km] · Pn–pt [godziny] · Tel. [telefon]</p>
      </div>
    </div>
  );
}
