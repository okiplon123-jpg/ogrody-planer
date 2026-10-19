import Link from "next/link";

/* Specimen cells: real paver textures (CC0). Replace with photos of the firm's own sample boards when they exist. */
const SPECIMENS: [string, string][] = [
  ["kostka-jodelka-szara", "szara · jodełka"],
  ["kostka-geometryczna", "szara · kształt Z"],
  ["kostka-jodelka-brazowa", "brązowa · jodełka"],
  ["kostka-czerwona", "ceglasta · jodełka"],
];

export function Specimens() {
  return (
    <ul className="grid h-full grid-cols-2 border-t border-[var(--color-ink)] md:border-t-0">
      {SPECIMENS.map(([f, n], i) => (
        <li key={f} className={`flex flex-col ${i % 2 ? "border-l border-[var(--color-ink)]" : ""} ${i > 1 ? "border-t border-[var(--color-ink)]" : ""}`}>
          <Link href="/wizualizator" className="group flex h-full flex-col" aria-label={`Przymierz kostkę: ${n}`}>
            <span className="cell-photo aspect-square md:aspect-auto md:min-h-[14rem] md:flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/zdjecia/${f}.jpg`} alt="" loading="eager" />
            </span>
            <span className="label spec-cap block border-t border-[var(--color-rule)] px-3 py-2">{n}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
