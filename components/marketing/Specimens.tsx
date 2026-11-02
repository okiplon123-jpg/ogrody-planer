/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { PHOTOS } from "@/lib/realizacje";

/* Hero cells: two real jobs (the firm's own photos). The full set is in the Realizacje section below. */
const SPECIMENS = [PHOTOS.podjazdPlyty, PHOTOS.podjazdCzerwony];

export function Specimens() {
  return (
    <ul className="grid h-full grid-cols-2 border-t border-[var(--color-ink)] md:grid-cols-1 md:grid-rows-2 md:border-t-0">
      {SPECIMENS.map((p, i) => (
        <li key={p.src} className={`flex min-h-0 flex-col ${i ? "border-l border-[var(--color-ink)] md:border-l-0 md:border-t" : ""}`}>
          <Link href="/#realizacje" className="group flex h-full flex-col" aria-label={`Zobacz realizacje: ${p.cap}`}>
            <span className="cell-photo relative aspect-square md:aspect-auto md:min-h-0 md:flex-1">
              <img src={p.src} alt={p.alt} width={p.w} height={p.h} {...(i === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })} decoding="async" className="absolute inset-0" />
            </span>
            <span className="label spec-cap block border-t border-[var(--color-rule)] px-2 py-2">{p.cap}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
