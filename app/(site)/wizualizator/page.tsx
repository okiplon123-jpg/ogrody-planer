import { VisualizerLoader } from "@/components/visualizer/VisualizerLoader";
export const metadata = { title: "Wizualizator kostki i trawnika na Twoim zdjęciu — Gryczewski Białystok", description: "Wgraj zdjęcie podjazdu lub ogrodu, zaznacz cztery rogi i przymierz kostkę albo trawnik. Zdjęcie zostaje w Twojej przeglądarce." };

export default function Page() {
  return (
    <section className="pad py-[clamp(3rem,8vw,7rem)]">
      <h1 className="display-m max-w-[16ch]">przymierz kostkę lub trawnik<span className="period" aria-hidden /></h1>
      <p className="prose-m mt-8 text-[var(--text-lg)] leading-snug">Wgraj zdjęcie podjazdu, tarasu, ścieżki albo ogrodu, zaznacz cztery rogi i wybierz kostkę lub trawnik. Zdjęcie zostaje w Twojej przeglądarce.</p>
      <div className="mt-12 border-y border-[var(--color-ink)] py-6"><VisualizerLoader /></div>
      <p className="label mt-6">wizualizacja jest poglądowa — rzeczywisty kolor kostki i trawnika zależy od partii i oświetlenia</p>
    </section>
  );
}
