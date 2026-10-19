"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* N1a: the site has exactly two content destinations (usługi, wizualizator); everything else lives in the footer colophon. */
export function Nav() {
  const path = usePathname();
  const cur = (h: string) => (path.startsWith(h) ? "page" : undefined);
  return (
    <header className="nav">
      <div className="nav-in">
        <Link href="/" className="wordmark" aria-label="nazwa marki — strona główna">nazwa marki<span className="period" aria-hidden /></Link>
        <div className="nav-row2">
          <Link href="/uslugi" className="nav-link" aria-current={cur("/uslugi")}>usługi</Link>
          <Link href="/wizualizator" className="nav-link" aria-current={cur("/wizualizator")}>wizualizator</Link>
        </div>
        <a href="tel:+48000000000" className="btn btn-signal btn-sm">zadzwoń<span className="hide-sm">&nbsp;[telefon]</span></a>
      </div>
    </header>
  );
}
