import { VisualizerLoader } from "@/components/visualizer/VisualizerLoader";
export const metadata = { title: "Wizualizator kostki brukowej na Twoim zdjęciu — NAZWA MARKI [miasto]", description: "Wgraj zdjęcie podjazdu, zaznacz cztery rogi nawierzchni i przymierz kostkę. Zdjęcie zostaje w Twojej przeglądarce." };

export default function Page() {
  return (
    <section className="pad py-[clamp(3rem,8vw,7rem)]">
      <h1 className="display max-w-[14ch]">przymierz kostkę<span className="period" aria-hidden /></h1>
      <p className="prose-m mt-8 text-[var(--text-lg)] leading-snug">Wgraj zdjęcie podjazdu, tarasu lub ścieżki, zaznacz cztery rogi nawierzchni i wybierz kostkę. Zdjęcie zostaje w Twojej przeglądarce.</p>
      <div className="mt-12 border-y border-[var(--color-ink)] py-6"><VisualizerLoader /></div>
      <p className="label mt-6">wizualizacja jest poglądowa — rzeczywisty kolor kostki zależy od partii i oświetlenia</p>
    </section>
  );
}
