import { Portfolio } from "@/components/marketing/Portfolio";
export const metadata = { title: "Realizacje — NAZWA MARKI" };
export default function Page() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-36 md:px-10">
      <p className="eyebrow mb-3 text-forest">Realizacje</p><h1 className="mb-4 font-serif text-6xl md:text-8xl">Wybrane projekty</h1>
      <p className="mb-12 max-w-xl text-charcoal/65">Poniższe projekty to materiały demonstracyjne (ilustracje), nie opis rzeczywistych prac firmy.</p>
      <Portfolio />
    </div>
  );
}
