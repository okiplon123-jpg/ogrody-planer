import { VisualizerLoader } from "@/components/visualizer/VisualizerLoader";
export const metadata = { title: "Wizualizator kostki brukowej na Twoim zdjęciu | Gryczewski", description: "Wgraj zdjęcie podjazdu lub ogrodu, zaznacz cztery rogi i przymierz kostkę albo trawnik. Zdjęcie zostaje w Twojej przeglądarce." };

export default function Page() {
  return (
    <section className="pad py-[clamp(3rem,8vw,7rem)]">
      <h1 className="display-m max-w-[16ch]">przymierz kostkę lub trawnik<span className="period" aria-hidden /></h1>
      <p className="prose-m mt-8 text-[var(--text-lg)] leading-snug">Wgraj zdjęcie podjazdu, tarasu, ścieżki albo ogrodu, zaznacz cztery rogi i wybierz kostkę lub trawnik. Zdjęcie zostaje w Twojej przeglądarce.</p>
      <div className="mt-12 border-y border-[var(--color-ink)] py-6"><VisualizerLoader /></div>
      <p className="label mt-6">wizualizacja jest poglądowa — rzeczywisty kolor kostki i trawnika zależy od partii i oświetlenia</p>

      <section className="mt-16 grid grid-cols-6 gap-y-8 md:grid-cols-12">
        <div className="col-span-6 md:col-span-5">
          <h2 className="h3">jak korzystać z wizualizatora</h2>
          <ol className="prose-m mt-4 space-y-2">
            <li>Wgraj zdjęcie podjazdu, tarasu, ścieżki albo ogrodu (z telefonu albo komputera).</li>
            <li>Zaznacz cztery rogi miejsca, które ma być wyłożone kostką albo zazielenione.</li>
            <li>Wybierz kostkę lub trawnik i dopasuj wzór oraz wielkość. Suwakiem porównasz zdjęcie przed i po.</li>
            <li>Pobierz obraz i zadzwoń: wycenę podajemy po obejrzeniu terenu.</li>
          </ol>
        </div>
        <div className="col-span-6 md:col-span-6 md:col-start-7">
          <h2 className="h3">co możesz przymierzyć</h2>
          <p className="prose-m mt-4">Kostkę betonową, szlachetną, płyty tarasowe, kamień naturalny, żwir i trawnik. Układamy każdy rodzaj kostki, więc wybór w wizualizatorze nie ogranicza tego, co położymy u Ciebie.</p>
          <h2 className="h3 mt-8">prywatność</h2>
          <p className="prose-m mt-3">Zdjęcie jest przetwarzane tylko w Twojej przeglądarce i nigdzie go nie wysyłamy.</p>
          <p className="prose-m mt-6">Wolisz zaplanować całą działkę? Otwórz <a href="/planer" className="underline underline-offset-4">planer ogrodu</a> albo <a href="/kontakt" className="underline underline-offset-4">umów oględziny</a>.</p>
        </div>
      </section>
    </section>
  );
}
