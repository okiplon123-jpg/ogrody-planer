import { PhotoSlot } from "@/components/marketing/PhotoSlot";
export const metadata = { title: "O nas — ekipa od kostki brukowej NAZWA MARKI [miasto]" };
export default function Page() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-14 md:px-8 md:py-24">
      <p className="eyebrow text-rust">O nas</p>
      <h1 className="mt-3 font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.92]">Mała ekipa. Kostka od początku do końca.</h1>
      <div className="mt-12 grid gap-8 md:grid-cols-[1fr_1.2fr]">
        <div className="h-[420px]"><PhotoSlot src="/zdjecia/plac-przy-kosciele.jpg" alt="Zagęszczarka na świeżo ułożonym placu" brief="ekipa przy pracy" className="object-[50%_62%]" /></div>
        <div className="space-y-5 text-xl leading-relaxed text-ink/80">
          <p>[Tu historia firmy: od kiedy układacie kostkę, skąd jesteście, jak zaczęliście. Prawdziwe zdania, nie hasła.]</p>
          <p>[Kto jest w ekipie, kto przyjeżdża na pomiar, kto układa. Imiona i zdjęcia.]</p>
          <p>[Jedna konkretna historia trudnej realizacji: teren, problem, rozwiązanie.]</p>
          <p className="eyebrow border-t-[1.5px] border-ink pt-4 text-ink/60">Działamy: [miasto i okolice, promień km] · Sprzęt: [lista maszyn] · Pn–pt [godziny]</p>
        </div>
      </div>
    </div>
  );
}
