import Link from "next/link";

const ITEMS = [
  ["kostka-geometryczna", "Szara, kształt Z", "50% 35%"],
  ["kostka-jodelka-szara", "Szara, jodełka", "50% 50%"],
  ["kostka-jodelka-brazowa", "Brązowa, jodełka", "50% 40%"],
  ["kostka-czerwona", "Ceglasta, jodełka", "50% 50%"],
];
/** Photos are generic close-ups (Pexels). Replace with photos of the company's own sample boards. */
export function Swatches() {
  return (
    <div className="grid grid-cols-2 border-[1.5px] border-ink md:grid-cols-4">
      {ITEMS.map(([f, name, pos], i) => (
        <Link href="/wizualizator" key={f} className={`group block border-ink ${i % 2 ? "border-l-[1.5px]" : ""} ${i > 1 ? "border-t-[1.5px] md:border-t-0" : ""} ${i > 0 ? "md:border-l-[1.5px]" : ""}`}>
          <div className="aspect-[4/3] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/zdjecia/${f}.jpg`} alt={`Kostka: ${name}`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: pos }} />
          </div>
          <div className="flex items-baseline justify-between px-3 py-2"><span className="font-serif text-lg">{name}</span><span className="eyebrow text-rust opacity-0 transition group-hover:opacity-100">przymierz →</span></div>
        </Link>
      ))}
    </div>
  );
}
