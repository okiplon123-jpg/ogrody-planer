import { Visualizer } from "@/components/visualizer/Visualizer";
export const metadata = { title: "Wizualizator kostki brukowej na Twoim zdjęciu — NAZWA MARKI" };
export default function Page() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-32 md:px-10">
      <h1 className="mb-2 font-serif text-5xl md:text-7xl">Zobacz kostkę na swoim podjeździe</h1>
      <p className="mb-8 max-w-2xl text-charcoal/70">Wgraj zdjęcie, zaznacz nawierzchnię i przymierz różne kostki. Zajmuje to minutę, a zdjęcie nie opuszcza Twojej przeglądarki.</p>
      <Visualizer />
    </div>
  );
}
