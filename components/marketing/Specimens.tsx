import Link from "next/link";

/* Specimen cells: real textures (CC0, see public/zdjecia/ZRODLA.md): two pavers, two lawns. Swap for the firm's own sample boards and job photos when they exist. */
const SPECIMENS: [string, string, string][] = [
  ["/zdjecia/kostka-jodelka-szara.jpg", "kostka szara", "/wizualizator"],
  ["/textures/grass_roll/grass_roll_diff_1k.jpg", "trawnik z rolki", "/wizualizator"],
  ["/zdjecia/kostka-jodelka-brazowa.jpg", "kostka brązowa", "/wizualizator"],
  ["/textures/grass_natural/grass_natural_diff_1k.jpg", "trawnik siany", "/wizualizator"],
];

export function Specimens() {
  return (
    <ul className="grid h-full grid-cols-2 border-t border-[var(--color-ink)] md:border-t-0">
      {SPECIMENS.map(([src, n, href], i) => (
        <li key={src} className={`flex flex-col ${i % 2 ? "border-l border-[var(--color-ink)]" : ""} ${i > 1 ? "border-t border-[var(--color-ink)]" : ""}`}>
          <Link href={href} className="group flex h-full flex-col" aria-label={`Przymierz: ${n}`}>
            <span className="cell-photo aspect-square md:aspect-auto md:min-h-[14rem] md:flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="eager" />
            </span>
            <span className="label spec-cap block border-t border-[var(--color-rule)] px-2 py-2">{n}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
