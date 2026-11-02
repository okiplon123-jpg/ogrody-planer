import Link from "next/link";

/* Specimen cells: real textures (CC0, see public/zdjecia/ZRODLA.md): two pavers, two lawns. Swap for the firm's own sample boards and job photos when they exist. */
const SPECIMENS: [string, string, string][] = [
  ["/zdjecia/kostka-jodelka-brazowa-sm.webp", "kostka brukowa", "/wizualizator"],
  ["/textures/grass_roll/grass_roll_diff_512.webp", "ogrody", "/wizualizator"],
];

export function Specimens() {
  return (
    <ul className="grid h-full grid-cols-2 border-t border-[var(--color-ink)] md:grid-cols-1 md:grid-rows-2 md:border-t-0">
      {SPECIMENS.map(([src, n, href], i) => (
        <li key={src} className={`flex min-h-0 flex-col ${i ? "border-l border-[var(--color-ink)] md:border-l-0 md:border-t" : ""}`}>
          <Link href={href} className="group flex h-full flex-col" aria-label={`Przymierz: ${n}`}>
            <span className="cell-photo relative aspect-square bg-cover bg-center md:aspect-auto md:min-h-0 md:flex-1" style={{ backgroundImage: `url(${src})` }} aria-hidden />
            <span className="label spec-cap block border-t border-[var(--color-rule)] px-2 py-2">{n}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
