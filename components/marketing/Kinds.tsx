import Link from "next/link";

/* Real textures (CC0, see public/zdjecia/ZRODLA.md). Only a sample: the claim is "every kind", this grid just shows a spread. */
const KINDS: [string, string][] = [
  ["/zdjecia/kostka-jodelka-szara.jpg", "szara, jodełka"],
  ["/zdjecia/kostka-geometryczna.jpg", "szara, kształt Z"],
  ["/textures/concrete_pavers/concrete_pavers_diff_512.jpg", "behaton"],
  ["/zdjecia/kostka-jodelka-brazowa.jpg", "brązowa"],
  ["/zdjecia/kostka-czerwona.jpg", "ceglasta"],
  ["/textures/brick_pavement_02/brick_pavement_02_diff_512.jpg", "granitowa"],
  ["/textures/floor_klinkers_01/floor_klinkers_01_diff_512.jpg", "klinkierowa"],
  ["/textures/cobblestone_floor_01/cobblestone_floor_01_diff_512.jpg", "bruk kamienny"],
];

export function Kinds() {
  return (
    <ul className="grid grid-cols-2 border-y border-[var(--color-ink)] md:grid-cols-4">
      {KINDS.map(([src, n], i) => (
        <li key={src} className={`${i % 2 ? "border-l border-[var(--color-ink)]" : ""} ${i % 4 ? "md:border-l md:border-[var(--color-ink)]" : "md:border-l-0"} ${i > 1 ? "border-t border-[var(--color-ink)]" : ""} ${i > 3 ? "md:border-t md:border-[var(--color-ink)]" : "md:border-t-0"}`}>
          <Link href="/wizualizator" className="group flex h-full flex-col" aria-label={`Przymierz: ${n}`}>
            <span className="cell-photo aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
            </span>
            <span className="label spec-cap block px-2 py-2">{n}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
