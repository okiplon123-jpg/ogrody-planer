import { VisualizerLoader } from "@/components/visualizer/VisualizerLoader";
export const metadata = { title: "Wizualizator kostki brukowej na Twoim zdjęciu — NAZWA MARKI" };
export default function Page() {
  return (
    <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8 md:py-20">
      <h1 className="mb-2 font-serif text-[clamp(2.8rem,6vw,6rem)] leading-[0.95]">Zobacz kostkę na swoim podjeździe</h1>
      <p className="mb-8 max-w-2xl text-charcoal/70">Wgraj zdjęcie, zaznacz nawierzchnię i przymierz różne kostki. Zajmuje to minutę, a zdjęcie nie opuszcza Twojej przeglądarki.</p>
      <VisualizerLoader />
    </div>
  );
}
